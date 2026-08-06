import { Router } from 'express'
import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { query, withTransaction, auditLog } from '../db/index'
import { requireAuth } from '../middleware/auth'
import { buildAccessState } from './auth'
import type { EntitlementSummary, OrderSummary } from '../types'

const router = Router()

router.use(requireAuth)

// ------------------------------------------------------------------ GET /entitlements

router.get('/entitlements', async (req, res) => {
  try {
    const result = await query<{
      id: string
      entitlement_type: string
      status: string
      source: string
      granted_at: string
      expires_at: string | null
      resource_mapping: Record<string, unknown>
    }>(
      `SELECT id, entitlement_type, status, source, granted_at, expires_at, resource_mapping
       FROM entitlements
       WHERE user_id = $1
       ORDER BY granted_at DESC`,
      [req.session.userId],
    )

    const entitlements: EntitlementSummary[] = result.rows.map((row) => ({
      id: row.id,
      type: row.entitlement_type as EntitlementSummary['type'],
      status: row.status as EntitlementSummary['status'],
      source: row.source as EntitlementSummary['source'],
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      resourceMapping: row.resource_mapping,
    }))

    res.json({ entitlements })
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

// ------------------------------------------------------------------ GET /orders

router.get('/orders', async (req, res) => {
  try {
    const result = await query<{
      id: string
      product_name: string
      order_status: string
      expected_amount: string
      expected_currency: string
      checkout_url: string | null
      created_at: string
      fulfilled_at: string | null
    }>(
      `SELECT po.id, p.name AS product_name, po.order_status,
              po.expected_amount, po.expected_currency,
              po.checkout_url, po.created_at, po.fulfilled_at
       FROM payment_orders po
       JOIN products p ON p.id = po.product_id
       WHERE po.user_id = $1
       ORDER BY po.created_at DESC`,
      [req.session.userId],
    )

    const orders: OrderSummary[] = result.rows.map((row) => ({
      id: row.id,
      productName: row.product_name,
      orderStatus: row.order_status as OrderSummary['orderStatus'],
      expectedAmount: row.expected_amount,
      expectedCurrency: row.expected_currency,
      checkoutUrl: row.checkout_url,
      createdAt: row.created_at,
      fulfilledAt: row.fulfilled_at,
    }))

    res.json({ orders })
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

// ------------------------------------------------------------------ POST /redeem

const redeemSchema = z.object({
  code: z.string().min(1).max(128),
})

router.post('/redeem', async (req, res) => {
  const parse = redeemSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid redemption code.' })
    return
  }

  const rawCode = parse.data.code.trim()
  const codeHash = createHash('sha256').update(rawCode).digest('hex')
  const userId = req.session.userId!

  type RedeemResult = { error: string; status: 400 | 409 | 410 } | { ok: true }

  try {
    const result = await withTransaction<RedeemResult>(async (client) => {
      // Lock the code row to prevent concurrent over-redemption
      const codeRes = await client.query<{
        id: string
        active: boolean
        max_uses: number
        uses: number
        expires_at: string | null
        entitlement_mapping: Record<string, unknown>
        product_id: string | null
      }>(
        `SELECT id, active, max_uses, uses, expires_at, entitlement_mapping, product_id
         FROM redemption_codes
         WHERE code_hash = $1
         FOR UPDATE`,
        [codeHash],
      )

      if (codeRes.rows.length === 0) {
        return { error: 'Invalid redemption code.', status: 400 as const }
      }

      const code = codeRes.rows[0]

      if (!code.active) {
        return { error: 'Invalid redemption code.', status: 400 as const }
      }

      if (code.expires_at && new Date(code.expires_at) < new Date()) {
        return { error: 'This redemption code has expired.', status: 410 as const }
      }

      if (code.uses >= code.max_uses) {
        return { error: 'Invalid redemption code.', status: 400 as const }
      }

      const alreadyRedeemed = await client.query(
        `SELECT id FROM redemption_events WHERE code_id = $1 AND user_id = $2`,
        [code.id, userId],
      )
      if (alreadyRedeemed.rows.length > 0) {
        return { error: 'You have already redeemed this code.', status: 409 as const }
      }

      const mapping = code.entitlement_mapping
      const entType = (mapping.entitlementType as string) ?? 'character'

      const entRes = await client.query<{ id: string }>(
        `INSERT INTO entitlements
           (user_id, product_id, entitlement_type, resource_mapping, status, source, source_reference)
         VALUES ($1, $2, $3, $4, 'active', 'redemption', $5)
         RETURNING id`,
        [userId, code.product_id, entType, JSON.stringify(mapping), code.id],
      )
      const entitlementId = entRes.rows[0].id

      await client.query(
        `UPDATE redemption_codes SET uses = uses + 1 WHERE id = $1`,
        [code.id],
      )

      await client.query(
        `INSERT INTO redemption_events (code_id, user_id, entitlement_id)
         VALUES ($1, $2, $3)`,
        [code.id, userId, entitlementId],
      )

      await auditLog(client, userId, 'code_redeemed', 'redemption_code', code.id, { entitlementId })

      return { ok: true as const }
    })

    if ('error' in result) {
      res.status(result.status).json({ error: result.error })
      return
    }

    const state = await buildAccessState(userId)
    res.json({ ok: true, access: state })
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

// ------------------------------------------------------------------ helpers (used by admin.ts)

export function generateRedemptionCode(): { rawCode: string; codeHash: string } {
  const rawCode = randomBytes(16).toString('base64url')
  const codeHash = createHash('sha256').update(rawCode).digest('hex')
  return { rawCode, codeHash }
}

export function hashCode(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export function safeCodeCompare(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length, 64)
  const aBuf = Buffer.alloc(len, 0)
  const bBuf = Buffer.alloc(len, 0)
  Buffer.from(a).copy(aBuf)
  Buffer.from(b).copy(bBuf)
  return timingSafeEqual(aBuf, bBuf) && a.length === b.length
}

export { router as accountRouter }
