import { Router } from 'express'
import { query, auditLog } from '../db/index'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

// ------------------------------------------------------------------ GET /orders/:id

router.get('/orders/:id', async (req, res) => {
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
      user_id: string
    }>(
      `SELECT po.id, p.name AS product_name, po.order_status,
              po.expected_amount, po.expected_currency,
              po.checkout_url, po.created_at, po.fulfilled_at, po.user_id
       FROM payment_orders po
       JOIN products p ON p.id = po.product_id
       WHERE po.id = $1`,
      [req.params.id],
    )

    const order = result.rows[0]
    if (!order || order.user_id !== req.session.userId) {
      res.status(404).json({ error: 'Order not found.' })
      return
    }

    res.json({
      id: order.id,
      productName: order.product_name,
      orderStatus: order.order_status,
      expectedAmount: order.expected_amount,
      expectedCurrency: order.expected_currency,
      checkoutUrl: order.checkout_url,
      createdAt: order.created_at,
      fulfilledAt: order.fulfilled_at,
    })
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

// ------------------------------------------------------------------ POST /checkout

router.post('/checkout', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    res.status(503).json({ error: 'Payments are not available in this environment.' })
    return
  }
  if (!process.env.NOWPAYMENTS_API_KEY) {
    res.status(503).json({ error: 'Payment provider is not configured.' })
    return
  }

  const { productId } = req.body as { productId?: string }
  if (!productId) {
    res.status(400).json({ error: 'productId is required.' })
    return
  }

  const userId = req.session.userId!

  try {
    const productRes = await query<{
      id: string
      name: string
      price_amount: string
      price_currency: string
      active: boolean
    }>(
      `SELECT id, name, price_amount, price_currency, active
       FROM products
       WHERE id = $1`,
      [productId],
    )

    const product = productRes.rows[0]
    if (!product || !product.active) {
      res.status(404).json({ error: 'Product not found or inactive.' })
      return
    }

    // Load price from DB — never trust the frontend
    const priceAmount = parseFloat(product.price_amount)
    const priceCurrency = product.price_currency

    const orderRes = await query<{ id: string }>(
      `INSERT INTO payment_orders
         (user_id, product_id, provider, order_status, expected_amount, expected_currency)
       VALUES ($1, $2, 'nowpayments', 'pending', $3, $4)
       RETURNING id`,
      [userId, product.id, priceAmount, priceCurrency],
    )
    const orderId = orderRes.rows[0].id

    const backendUrl = (process.env.BACKEND_PUBLIC_URL ?? '').replace(/\/$/, '')
    const frontendUrl = (process.env.FRONTEND_ORIGIN ?? '').replace(/\/$/, '')
    const apiBase = (process.env.NOWPAYMENTS_API_BASE_URL ?? 'https://api.nowpayments.io').replace(/\/$/, '')

    const invoiceRes = await fetch(`${apiBase}/v1/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: priceAmount,
        price_currency: priceCurrency,
        order_id: orderId,
        order_description: product.name,
        ipn_callback_url: `${backendUrl}/v1/webhooks/nowpayments`,
        success_url: `${frontendUrl}/#account`,
        cancel_url: `${frontendUrl}/#account`,
      }),
    })

    if (!invoiceRes.ok) {
      await query(
        `UPDATE payment_orders SET order_status = 'failed', updated_at = NOW() WHERE id = $1`,
        [orderId],
      )
      res.status(502).json({ error: 'Payment provider error. Please try again.' })
      return
    }

    const invoice = await invoiceRes.json() as { id?: string; invoice_url?: string }

    await query(
      `UPDATE payment_orders
       SET provider_invoice_id = $2, checkout_url = $3, updated_at = NOW()
       WHERE id = $1`,
      [orderId, String(invoice.id ?? ''), invoice.invoice_url ?? null],
    )

    await auditLog(null, userId, 'checkout_created', 'payment_order', orderId, {
      productId: product.id, amount: priceAmount, currency: priceCurrency,
    })

    res.json({
      orderId,
      checkoutUrl: invoice.invoice_url ?? null,
      productName: product.name,
      priceAmount,
      priceCurrency,
    })
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

export { router as paymentsRouter }
