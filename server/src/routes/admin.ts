import { Router } from 'express'
import { z } from 'zod'
import { query, withTransaction, auditLog } from '../db/index'
import { requireOwner } from '../middleware/auth'
import { adminMutationRateLimit } from '../middleware/rateLimit'
import { generateRedemptionCode } from './account'

const router = Router()

// All admin routes require owner role — checked server-side, not from session text or localStorage
router.use(requireOwner)

// ------------------------------------------------------------------ GET /dashboard

router.get('/dashboard', async (_req, res) => {
  try {
    const [users, entitlements, payments, redemptions, recentAudit] = await Promise.all([
      query<{ total: string; active: string; suspended: string }>(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'active') AS active,
           COUNT(*) FILTER (WHERE status = 'suspended') AS suspended
         FROM users`,
      ),
      query<{ active_count: string }>(
        `SELECT COUNT(*) FILTER (WHERE status = 'active') AS active_count FROM entitlements`,
      ),
      query<{ pending: string; completed: string; failed: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE order_status = 'pending') AS pending,
           COUNT(*) FILTER (WHERE order_status = 'completed') AS completed,
           COUNT(*) FILTER (WHERE order_status IN ('failed', 'expired')) AS failed
         FROM payment_orders`,
      ),
      query<{ recent: string }>(
        `SELECT COUNT(*) FILTER (WHERE redeemed_at > NOW() - INTERVAL '7 days') AS recent
         FROM redemption_events`,
      ),
      query<{ id: string; action: string; target_type: string | null; created_at: string }>(
        `SELECT id, action, target_type, created_at
         FROM audit_logs
         ORDER BY created_at DESC
         LIMIT 10`,
      ),
    ])

    res.json({
      users: users.rows[0],
      entitlements: entitlements.rows[0],
      payments: payments.rows[0],
      recentRedemptions: redemptions.rows[0]?.recent ?? '0',
      recentAudit: recentAudit.rows,
    })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

// ------------------------------------------------------------------ users

router.get('/users', async (req, res) => {
  const search = String(req.query.q ?? '').trim()
  try {
    const result = await query<{
      id: string; username: string; email: string; role: string
      status: string; created_at: string; last_login_at: string | null
    }>(
      `SELECT id, username, email, role, status, created_at, last_login_at
       FROM users
       WHERE ($1 = '' OR username ILIKE $2 OR email ILIKE $2)
       ORDER BY created_at DESC
       LIMIT 100`,
      [search, `%${search}%`],
    )
    res.json({ users: result.rows })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    const result = await query<{
      id: string; username: string; email: string; role: string
      status: string; created_at: string; last_login_at: string | null
    }>(
      `SELECT id, username, email, role, status, created_at, last_login_at
       FROM users WHERE id = $1`,
      [req.params.id],
    )
    if (!result.rows[0]) { res.status(404).json({ error: 'User not found.' }); return }
    res.json(result.rows[0])
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.post('/users/:id/suspend', adminMutationRateLimit, async (req, res) => {
  const actorId = req.session.userId!
  try {
    await withTransaction(async (client) => {
      const result = await client.query<{ role: string }>(
        `UPDATE users SET status = 'suspended', updated_at = NOW()
         WHERE id = $1 AND role != 'owner'
         RETURNING role`,
        [req.params.id],
      )
      if (!result.rows[0]) throw new Error('not_found_or_owner')
      await auditLog(client, actorId, 'user_suspended', 'user', req.params.id, {})
    })
    res.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'not_found_or_owner') {
      res.status(404).json({ error: 'User not found or cannot suspend owner.' })
      return
    }
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.post('/users/:id/reactivate', adminMutationRateLimit, async (req, res) => {
  const actorId = req.session.userId!
  try {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1`,
        [req.params.id],
      )
      await auditLog(client, actorId, 'user_reactivated', 'user', req.params.id, {})
    })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.get('/users/:id/entitlements', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, entitlement_type, status, source, granted_at, expires_at, resource_mapping
       FROM entitlements WHERE user_id = $1 ORDER BY granted_at DESC`,
      [req.params.id],
    )
    res.json({ entitlements: result.rows })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

const grantSchema = z.object({
  entitlementType: z.enum(['character', 'pack', 'full_archive']),
  resourceMapping: z.record(z.string(), z.unknown()).optional(),
  expiresAt: z.string().optional(),
})

router.post('/users/:id/entitlements', adminMutationRateLimit, async (req, res) => {
  const parse = grantSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ error: parse.error.issues[0]?.message ?? 'Invalid input.' })
    return
  }
  const actorId = req.session.userId!
  const d = parse.data
  try {
    await withTransaction(async (client) => {
      const entRes = await client.query<{ id: string }>(
        `INSERT INTO entitlements
           (user_id, entitlement_type, resource_mapping, status, source, source_reference, expires_at)
         VALUES ($1, $2, $3, 'active', 'admin', $4, $5)
         RETURNING id`,
        [
          req.params.id,
          d.entitlementType,
          JSON.stringify(d.resourceMapping ?? {}),
          actorId,
          d.expiresAt ?? null,
        ],
      )
      await auditLog(client, actorId, 'entitlement_granted', 'entitlement', entRes.rows[0].id, {
        targetUser: req.params.id, type: d.entitlementType,
      })
    })
    res.status(201).json({ ok: true })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.delete('/entitlements/:id', adminMutationRateLimit, async (req, res) => {
  const actorId = req.session.userId!
  try {
    await withTransaction(async (client) => {
      const result = await client.query<{ user_id: string }>(
        `UPDATE entitlements SET status = 'revoked', revoked_at = NOW()
         WHERE id = $1 RETURNING user_id`,
        [req.params.id],
      )
      if (!result.rows[0]) throw new Error('not_found')
      await auditLog(client, actorId, 'entitlement_revoked', 'entitlement', req.params.id, {
        targetUser: result.rows[0].user_id,
      })
    })
    res.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'not_found') {
      res.status(404).json({ error: 'Entitlement not found.' })
      return
    }
    res.status(500).json({ error: 'An error occurred.' })
  }
})

// ------------------------------------------------------------------ products

const productSchema = z.object({
  slug: z.string().min(1).max(100).refine((v) => /^[a-z0-9-]+$/.test(v), { message: 'slug must be lowercase alphanumeric with hyphens' }),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  productType: z.enum(['single_character', 'character_pack', 'full_archive']),
  priceAmount: z.number().min(0),
  priceCurrency: z.string().min(3).max(3).default('usd'),
  resourceMapping: z.record(z.string(), z.unknown()).optional(),
  active: z.boolean().optional(),
})

router.get('/products', async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, slug, name, description, product_type, price_amount, price_currency, active, created_at
       FROM products ORDER BY price_amount ASC`,
    )
    res.json({ products: result.rows })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.post('/products', adminMutationRateLimit, async (req, res) => {
  const parse = productSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ error: parse.error.issues[0]?.message ?? 'Invalid input.' })
    return
  }
  const actorId = req.session.userId!
  const d = parse.data
  try {
    const result = await query<{ id: string }>(
      `INSERT INTO products (slug, name, description, product_type, price_amount, price_currency, resource_mapping, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [d.slug, d.name, d.description ?? '', d.productType, d.priceAmount, d.priceCurrency, JSON.stringify(d.resourceMapping ?? {}), d.active ?? true],
    )
    await auditLog(null, actorId, 'product_created', 'product', result.rows[0].id, { slug: d.slug })
    res.status(201).json({ id: result.rows[0].id })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.patch('/products/:id', adminMutationRateLimit, async (req, res) => {
  const parse = productSchema.partial().safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ error: parse.error.issues[0]?.message ?? 'Invalid input.' })
    return
  }
  const actorId = req.session.userId!
  const d = parse.data
  const updates: string[] = []
  const params: unknown[] = [req.params.id]
  const add = (col: string, val: unknown) => { params.push(val); updates.push(`${col} = $${params.length}`) }
  if (d.name !== undefined) add('name', d.name)
  if (d.description !== undefined) add('description', d.description)
  if (d.priceAmount !== undefined) add('price_amount', d.priceAmount)
  if (d.priceCurrency !== undefined) add('price_currency', d.priceCurrency)
  if (d.active !== undefined) add('active', d.active)
  if (d.resourceMapping !== undefined) add('resource_mapping', JSON.stringify(d.resourceMapping))
  if (!updates.length) { res.status(400).json({ error: 'No fields to update.' }); return }
  updates.push('updated_at = NOW()')
  try {
    await query(`UPDATE products SET ${updates.join(', ')} WHERE id = $1`, params)
    await auditLog(null, actorId, 'product_updated', 'product', req.params.id, d as Record<string, unknown>)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

// ------------------------------------------------------------------ payments

router.get('/payments', async (req, res) => {
  const search = String(req.query.q ?? '').trim()
  const status = String(req.query.status ?? '').trim()
  try {
    const result = await query(
      `SELECT po.id, po.order_status, po.expected_amount, po.expected_currency,
              po.provider_payment_id, po.created_at, po.fulfilled_at,
              u.username, p.name AS product_name
       FROM payment_orders po
       JOIN users u ON u.id = po.user_id
       JOIN products p ON p.id = po.product_id
       WHERE ($1 = '' OR u.username ILIKE $3 OR po.provider_payment_id ILIKE $3)
         AND ($2 = '' OR po.order_status = $2)
       ORDER BY po.created_at DESC
       LIMIT 200`,
      [search, status, `%${search}%`],
    )
    res.json({ payments: result.rows })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.post('/payments/:id/reconcile', adminMutationRateLimit, async (req, res) => {
  const actorId = req.session.userId!
  const orderId = req.params.id
  try {
    const orderRes = await query<{
      id: string; user_id: string; product_id: string; order_status: string
      provider_payment_id: string | null; expected_amount: string
    }>(
      `SELECT id, user_id, product_id, order_status, provider_payment_id, expected_amount
       FROM payment_orders WHERE id = $1`,
      [orderId],
    )
    if (!orderRes.rows[0]) { res.status(404).json({ error: 'Order not found.' }); return }
    const order = orderRes.rows[0]

    if (order.order_status !== 'completed') {
      res.status(400).json({ error: 'Only completed orders can be manually reconciled.' })
      return
    }

    const existing = await query(
      `SELECT id FROM entitlements WHERE source = 'payment' AND source_reference = $1`,
      [orderId],
    )
    if (existing.rows.length > 0) {
      res.json({ ok: true, message: 'Entitlement already exists.' })
      return
    }

    const productRes = await query<{ product_type: string; resource_mapping: Record<string, unknown> }>(
      `SELECT product_type, resource_mapping FROM products WHERE id = $1`,
      [order.product_id],
    )
    if (!productRes.rows[0]) { res.status(404).json({ error: 'Product not found.' }); return }
    const product = productRes.rows[0]

    const entType = product.product_type === 'full_archive' ? 'full_archive'
      : product.product_type === 'character_pack' ? 'pack'
      : 'character'

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO entitlements
           (user_id, product_id, entitlement_type, resource_mapping, status, source, source_reference)
         VALUES ($1, $2, $3, $4, 'active', 'payment', $5)`,
        [order.user_id, order.product_id, entType, JSON.stringify(product.resource_mapping), orderId],
      )
      await auditLog(client, actorId, 'payment_reconciled', 'payment_order', orderId, {
        userId: order.user_id,
      })
    })

    res.json({ ok: true, message: 'Entitlement granted.' })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

// ------------------------------------------------------------------ redemption codes

const codeSchema = z.object({
  maxUses: z.number().int().min(1).max(10000).default(1),
  productId: z.string().optional(),
  entitlementMapping: z.record(z.string(), z.unknown()).optional(),
  expiresAt: z.string().optional(),
})

router.get('/codes', async (_req, res) => {
  try {
    const result = await query(
      `SELECT rc.id, rc.max_uses, rc.uses, rc.active, rc.expires_at, rc.created_at,
              p.name AS product_name
       FROM redemption_codes rc
       LEFT JOIN products p ON p.id = rc.product_id
       ORDER BY rc.created_at DESC`,
    )
    res.json({ codes: result.rows })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.post('/codes', adminMutationRateLimit, async (req, res) => {
  const parse = codeSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ error: parse.error.issues[0]?.message ?? 'Invalid input.' })
    return
  }
  const actorId = req.session.userId!
  const d = parse.data
  const { rawCode, codeHash } = generateRedemptionCode()
  try {
    const result = await query<{ id: string }>(
      `INSERT INTO redemption_codes
         (code_hash, product_id, entitlement_mapping, max_uses, active, expires_at, created_by)
       VALUES ($1, $2, $3, $4, TRUE, $5, $6)
       RETURNING id`,
      [codeHash, d.productId ?? null, JSON.stringify(d.entitlementMapping ?? {}), d.maxUses, d.expiresAt ?? null, actorId],
    )
    await auditLog(null, actorId, 'redemption_code_created', 'redemption_code', result.rows[0].id, {
      maxUses: d.maxUses, hasExpiry: Boolean(d.expiresAt),
    })
    // rawCode shown once — never stored in plaintext
    res.status(201).json({ id: result.rows[0].id, code: rawCode })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

router.post('/codes/:id/deactivate', adminMutationRateLimit, async (req, res) => {
  const actorId = req.session.userId!
  try {
    await withTransaction(async (client) => {
      await client.query(`UPDATE redemption_codes SET active = FALSE WHERE id = $1`, [req.params.id])
      await auditLog(client, actorId, 'redemption_code_deactivated', 'redemption_code', req.params.id, {})
    })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

// ------------------------------------------------------------------ audit logs

router.get('/audit', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200)
  const offset = Number(req.query.offset ?? 0)
  try {
    const result = await query(
      `SELECT al.id, al.action, al.target_type, al.target_id, al.metadata, al.created_at,
              u.username AS actor_username
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_user_id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    res.json({ logs: result.rows })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

export { router as adminRouter }
