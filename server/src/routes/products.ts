import { Router } from 'express'
import { query } from '../db/index'

const router = Router()

router.get('/', async (_req, res) => {
  if (!process.env.DATABASE_URL) {
    res.json({ products: [] })
    return
  }

  try {
    const result = await query<{
      id: string
      slug: string
      name: string
      description: string
      product_type: string
      price_amount: string
      price_currency: string
    }>(
      `SELECT id, slug, name, description, product_type, price_amount, price_currency
       FROM products
       WHERE active = TRUE
       ORDER BY price_amount ASC`,
    )

    res.json({
      products: result.rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        type: row.product_type,
        priceAmount: row.price_amount,
        priceCurrency: row.price_currency,
      })),
    })
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

export { router as productsRouter }
