import { createHmac } from 'crypto'
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app, createApp } from '../src/app'

// Mirrors the server's sortObjectKeys helper so we can construct valid signatures.
function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys)
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortObjectKeys((value as Record<string, unknown>)[k])
        return acc
      }, {})
  }
  return value
}

function makeNowPaymentsSignature(payload: object): string {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET ?? ''
  const sorted = sortObjectKeys(payload)
  return createHmac('sha512', secret).update(JSON.stringify(sorted)).digest('hex')
}

async function getCsrf(): Promise<{ agent: ReturnType<typeof request.agent>; token: string }> {
  const agent = request.agent(app)
  const res = await agent.get('/v1/auth/csrf')
  return { agent, token: (res.body as { csrfToken: string }).csrfToken }
}

// ------------------------------------------------------------------ Checkout auth requirements

describe('Checkout authentication requirements', () => {
  it('POST /checkout without CSRF returns 403', async () => {
    const res = await request(app).post('/v1/payments/checkout').send({ productId: 'abc' })
    expect(res.status).toBe(403)
  })

  it('POST /checkout with CSRF but no session returns 401', async () => {
    const { agent, token } = await getCsrf()
    const res = await agent
      .post('/v1/payments/checkout')
      .set('X-CSRF-Token', token)
      .send({ productId: 'abc' })
    expect(res.status).toBe(401)
  })

  it('GET /orders/:id without session returns 401', async () => {
    const res = await request(app).get('/v1/payments/orders/00000000-0000-0000-0000-000000000000')
    expect(res.status).toBe(401)
  })

  it('POST /checkout returns 503 when DATABASE_URL is not set', async () => {
    // In test env DATABASE_URL is not set; the checkout handler returns 503 explicitly.
    // Log in as owner via the no-DB fallback path to get an authenticated session.
    const { agent, token: preToken } = await getCsrf()
    await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', preToken)
      .send({ username: 'sendai', password: 'TestPassword123!' })
    const csrfRes = await agent.get('/v1/auth/csrf')
    const token = (csrfRes.body as { csrfToken: string }).csrfToken
    const res = await agent
      .post('/v1/payments/checkout')
      .set('X-CSRF-Token', token)
      .send({ productId: 'some-product-id' })
    expect(res.status).toBe(503)
    expect((res.body as { error: string }).error).toMatch(/not available/i)
  })
})

// ------------------------------------------------------------------ Webhook signature verification

describe('Webhook signature verification', () => {
  it('rejects webhook missing x-nowpayments-sig header (400)', async () => {
    const res = await request(app)
      .post('/v1/webhooks/nowpayments')
      .send({ payment_id: '123', payment_status: 'finished' })
    expect(res.status).toBe(400)
    expect((res.body as { error: string }).error).toMatch(/missing signature/i)
  })

  it('rejects webhook with invalid HMAC signature (400)', async () => {
    const res = await request(app)
      .post('/v1/webhooks/nowpayments')
      .set('x-nowpayments-sig', 'deadbeef'.repeat(16))
      .send({ payment_id: '123', payment_status: 'finished' })
    expect(res.status).toBe(400)
    expect((res.body as { error: string }).error).toMatch(/invalid signature/i)
  })

  it('valid HMAC signature passes sig check (fails at DB step, not signature step)', async () => {
    // Keys sorted alphabetically so server re-serialization is identical.
    const payload = { order_id: 'test-order-id', payment_id: '123456', payment_status: 'finished' }
    const sig = makeNowPaymentsSignature(payload)
    const res = await request(app)
      .post('/v1/webhooks/nowpayments')
      .set('x-nowpayments-sig', sig)
      .send(payload)
    // Passes signature validation — the non-400 response confirms sig was accepted.
    // 500 comes from withTransaction (no DB), not from signature rejection.
    expect(res.status).not.toBe(400)
    expect((res.body as { error?: string }).error).not.toMatch(/signature/i)
  })
})

// ------------------------------------------------------------------ Admin access controls

describe('Admin access controls', () => {
  it('admin endpoints return 403 without owner session', async () => {
    const { agent, token } = await getCsrf()
    const res = await agent
      .post('/v1/admin/users/some-user-id/suspend')
      .set('X-CSRF-Token', token)
      .send({})
    expect(res.status).toBe(403)
  })

  it('admin products list returns 403 without session', async () => {
    const res = await request(app).get('/v1/admin/products')
    expect(res.status).toBe(403)
  })
})

// ------------------------------------------------------------------ Production DATABASE_URL guard

describe('Production DATABASE_URL guard', () => {
  it('createApp throws when NODE_ENV=production and DATABASE_URL is missing', () => {
    const origEnv = process.env.NODE_ENV
    const origDb = process.env.DATABASE_URL
    process.env.NODE_ENV = 'production'
    delete process.env.DATABASE_URL
    expect(() => createApp()).toThrow('DATABASE_URL is required in production')
    process.env.NODE_ENV = origEnv
    if (origDb !== undefined) process.env.DATABASE_URL = origDb
  })
})
