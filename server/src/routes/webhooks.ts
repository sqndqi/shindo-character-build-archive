import { Router, type Request } from 'express'
import { createHmac, createHash, timingSafeEqual } from 'crypto'
import { withTransaction, auditLog } from '../db/index'

const router = Router()

interface RawBodyRequest extends Request {
  rawBody?: Buffer
}

// ------------------------------------------------------------------ helpers

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys)
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectKeys((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

function verifyNowPaymentsSignature(rawBody: Buffer, signature: string, secret: string): boolean {
  let sorted: unknown
  try {
    sorted = sortObjectKeys(JSON.parse(rawBody.toString('utf8')))
  } catch {
    return false
  }
  const serialized = JSON.stringify(sorted)
  const expectedHex = createHmac('sha512', secret).update(serialized).digest('hex')
  const expectedBuf = Buffer.from(expectedHex, 'hex')
  let signatureBuf: Buffer
  try {
    signatureBuf = Buffer.from(signature, 'hex')
  } catch {
    return false
  }
  if (expectedBuf.length !== signatureBuf.length) return false
  return timingSafeEqual(expectedBuf, signatureBuf)
}

function mapProviderStatus(status: string): string {
  switch (status) {
    case 'finished': return 'completed'
    case 'failed': return 'failed'
    case 'expired': return 'expired'
    case 'refunded':
    case 'partially_refunded': return 'refunded'
    default: return 'processing'
  }
}

const TERMINAL_SUCCESS = new Set(['finished'])
const TERMINAL_REVERSAL = new Set(['refunded', 'partially_refunded'])

// ------------------------------------------------------------------ POST /nowpayments (IPN)

router.post('/nowpayments', async (req: RawBodyRequest, res) => {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET
  if (!ipnSecret) {
    res.status(500).json({ error: 'IPN secret not configured.' })
    return
  }

  const signature = req.headers['x-nowpayments-sig'] as string | undefined
  if (!signature) {
    res.status(400).json({ error: 'Missing signature.' })
    return
  }

  const rawBody = req.rawBody
  if (!rawBody?.length) {
    res.status(400).json({ error: 'Missing body.' })
    return
  }

  if (!verifyNowPaymentsSignature(rawBody, signature, ipnSecret)) {
    res.status(400).json({ error: 'Invalid signature.' })
    return
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>
  } catch {
    res.status(400).json({ error: 'Invalid JSON.' })
    return
  }

  const paymentId = String(payload.payment_id ?? '')
  const paymentStatus = String(payload.payment_status ?? '')
  const invoiceId = String(payload.order_id ?? payload.invoice_id ?? '')
  const payAmount = parseFloat(String(payload.actually_paid ?? payload.pay_amount ?? '0'))

  if (!paymentId || !paymentStatus) {
    res.status(400).json({ error: 'Invalid payload.' })
    return
  }

  const eventHash = createHash('sha256')
    .update(`nowpayments:${paymentId}:${paymentStatus}`)
    .digest('hex')

  try {
    await withTransaction(async (client) => {
      // Idempotency check
      const existingEvent = await client.query<{ id: string; status: string }>(
        `SELECT id, status FROM webhook_events WHERE event_hash = $1 FOR UPDATE`,
        [eventHash],
      )

      if (existingEvent.rows.length > 0) {
        await client.query(
          `UPDATE webhook_events SET status = 'duplicate', processed_at = NOW() WHERE event_hash = $1`,
          [eventHash],
        )
        return
      }

      const eventRes = await client.query<{ id: string }>(
        `INSERT INTO webhook_events
           (provider, event_hash, provider_payment_id, payload, status)
         VALUES ('nowpayments', $1, $2, $3, 'received')
         RETURNING id`,
        [eventHash, paymentId, JSON.stringify(payload)],
      )
      const eventId = eventRes.rows[0].id

      const orderRes = await client.query<{
        id: string
        user_id: string
        product_id: string
        order_status: string
        expected_amount: string
        expected_currency: string
      }>(
        `SELECT id, user_id, product_id, order_status, expected_amount, expected_currency
         FROM payment_orders
         WHERE provider_invoice_id = $1 OR id = $1
         LIMIT 1`,
        [invoiceId || paymentId],
      )

      const order = orderRes.rows[0]
      const internalStatus = mapProviderStatus(paymentStatus)

      if (order) {
        await client.query(
          `UPDATE payment_orders
           SET provider_payment_id = $2, provider_status = $3, order_status = $4,
               updated_at = NOW(),
               fulfilled_at = CASE WHEN $4 = 'completed' THEN NOW() ELSE fulfilled_at END
           WHERE id = $1`,
          [order.id, paymentId, paymentStatus, internalStatus],
        )
      }

      if (!order) {
        await client.query(
          `UPDATE webhook_events SET status = 'failed', processing_result = 'order_not_found', processed_at = NOW() WHERE id = $1`,
          [eventId],
        )
        return
      }

      if (TERMINAL_SUCCESS.has(paymentStatus)) {
        const expectedAmount = parseFloat(order.expected_amount)
        const amountOk = payAmount >= expectedAmount || Math.abs(payAmount - expectedAmount) < 0.01

        if (!amountOk) {
          await client.query(
            `UPDATE webhook_events SET status = 'failed', processing_result = 'amount_mismatch', processed_at = NOW() WHERE id = $1`,
            [eventId],
          )
          await auditLog(client, null, 'webhook_amount_mismatch', 'payment_order', order.id, {
            expected: expectedAmount, received: payAmount,
          })
          return
        }

        // Prevent duplicate fulfillment
        const alreadyFulfilled = await client.query(
          `SELECT id FROM entitlements WHERE source = 'payment' AND source_reference = $1`,
          [order.id],
        )
        if (alreadyFulfilled.rows.length > 0) {
          await client.query(
            `UPDATE webhook_events SET status = 'processed', processing_result = 'already_fulfilled', processed_at = NOW() WHERE id = $1`,
            [eventId],
          )
          return
        }

        const productRes = await client.query<{ product_type: string; resource_mapping: Record<string, unknown> }>(
          `SELECT product_type, resource_mapping FROM products WHERE id = $1`,
          [order.product_id],
        )
        const product = productRes.rows[0]

        if (!product) {
          await client.query(
            `UPDATE webhook_events SET status = 'failed', processing_result = 'product_not_found', processed_at = NOW() WHERE id = $1`,
            [eventId],
          )
          return
        }

        const entType = product.product_type === 'full_archive' ? 'full_archive'
          : product.product_type === 'character_pack' ? 'pack'
          : 'character'

        await client.query(
          `INSERT INTO entitlements
             (user_id, product_id, entitlement_type, resource_mapping, status, source, source_reference)
           VALUES ($1, $2, $3, $4, 'active', 'payment', $5)`,
          [order.user_id, order.product_id, entType, JSON.stringify(product.resource_mapping), order.id],
        )

        await auditLog(client, null, 'payment_fulfilled', 'payment_order', order.id, {
          userId: order.user_id, paymentId,
        })
        await client.query(
          `UPDATE webhook_events SET status = 'processed', processing_result = 'entitlement_granted', processed_at = NOW() WHERE id = $1`,
          [eventId],
        )
      } else if (TERMINAL_REVERSAL.has(paymentStatus)) {
        await client.query(
          `UPDATE entitlements SET status = 'revoked', revoked_at = NOW()
           WHERE source = 'payment' AND source_reference = $1`,
          [order.id],
        )
        await auditLog(client, null, 'payment_reversed', 'payment_order', order.id, {
          userId: order.user_id, paymentId,
        })
        await client.query(
          `UPDATE webhook_events SET status = 'processed', processing_result = 'entitlement_revoked', processed_at = NOW() WHERE id = $1`,
          [eventId],
        )
      } else {
        await client.query(
          `UPDATE webhook_events SET status = 'processed', processing_result = 'status_update_only', processed_at = NOW() WHERE id = $1`,
          [eventId],
        )
      }
    })

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'An error occurred.' })
  }
})

export { router as webhooksRouter }
