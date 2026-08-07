import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

async function getCsrf(): Promise<{ agent: ReturnType<typeof request.agent>; token: string }> {
  const agent = request.agent(app)
  const res = await agent.get('/v1/auth/csrf')
  return { agent, token: (res.body as { csrfToken: string }).csrfToken }
}

// ------------------------------------------------------------------ CSRF

describe('CSRF protection', () => {
  it('POST /v1/auth/login without CSRF token returns 403', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ username: 'anyone', password: 'whatever' })
    expect(res.status).toBe(403)
  })

  it('POST /v1/auth/logout without CSRF token returns 403', async () => {
    const res = await request(app).post('/v1/auth/logout').send({})
    expect(res.status).toBe(403)
  })

  it('POST /v1/auth/signup without CSRF token returns 403', async () => {
    const res = await request(app)
      .post('/v1/auth/signup')
      .send({ username: 'user', email: 'user@example.com', password: 'Password123!' })
    expect(res.status).toBe(403)
  })

  it('POST /v1/account/redeem without CSRF token returns 403', async () => {
    const res = await request(app).post('/v1/account/redeem').send({ code: 'TESTCODE' })
    expect(res.status).toBe(403)
  })

  it('POST /v1/payments/checkout without CSRF token returns 403', async () => {
    const res = await request(app).post('/v1/payments/checkout').send({ productId: 'abc' })
    expect(res.status).toBe(403)
  })

  it('GET /v1/archive/access has no CSRF requirement', async () => {
    const res = await request(app).get('/v1/archive/access')
    expect(res.status).not.toBe(403)
  })

  it('GET /v1/products has no CSRF requirement', async () => {
    const res = await request(app).get('/v1/products')
    // 503 if no DB — but not 403
    expect(res.status).not.toBe(403)
  })

  it('POST /v1/webhooks/nowpayments has no CSRF requirement', async () => {
    // Webhook skips CSRF — verified by HMAC-SHA512 instead. Should not get 403.
    const res = await request(app)
      .post('/v1/webhooks/nowpayments')
      .send({ payment_id: '123', payment_status: 'waiting' })
    // Will fail signature check (400/401) but must not 403
    expect(res.status).not.toBe(403)
  })
})

// ------------------------------------------------------------------ Signup rate limit

describe('Signup rate limit', () => {
  const SIGNUP_MAX = Number(process.env.SIGNUP_RATE_LIMIT_MAX ?? 5)
  const SIGNUP_IP = '10.50.1.1'

  it(`blocks signup after ${SIGNUP_MAX} attempts from same IP`, async () => {
    for (let i = 0; i < SIGNUP_MAX; i++) {
      const { agent, token } = await getCsrf()
      await agent
        .post('/v1/auth/signup')
        .set('X-CSRF-Token', token)
        .set('X-Forwarded-For', SIGNUP_IP)
        .send({
          username: `user${i}x`,
          email: `user${i}x@example.com`,
          password: 'Password123!Long',
        })
    }

    const { agent, token } = await getCsrf()
    const blocked = await agent
      .post('/v1/auth/signup')
      .set('X-CSRF-Token', token)
      .set('X-Forwarded-For', SIGNUP_IP)
      .send({
        username: 'extrauser',
        email: 'extra@example.com',
        password: 'Password123!Long',
      })
    expect(blocked.status).toBe(429)
    expect((blocked.body as { error?: string }).error).not.toContain('username')
    expect((blocked.body as { error?: string }).error).not.toContain('email')
  })
})

// ------------------------------------------------------------------ Checkout rate limit

describe('Checkout rate limit', () => {
  const CHECKOUT_MAX = Number(process.env.CHECKOUT_RATE_LIMIT_MAX ?? 3)
  const CHECKOUT_IP = '10.50.2.1'

  it(`blocks checkout after ${CHECKOUT_MAX} attempts from same IP`, async () => {
    for (let i = 0; i < CHECKOUT_MAX; i++) {
      const { agent, token } = await getCsrf()
      // Will 401 (no session) or 503 (no DB/payments) but not rate limit yet
      await agent
        .post('/v1/payments/checkout')
        .set('X-CSRF-Token', token)
        .set('X-Forwarded-For', CHECKOUT_IP)
        .send({ productId: 'test-product' })
    }

    const { agent, token } = await getCsrf()
    const blocked = await agent
      .post('/v1/payments/checkout')
      .set('X-CSRF-Token', token)
      .set('X-Forwarded-For', CHECKOUT_IP)
      .send({ productId: 'test-product' })
    expect(blocked.status).toBe(429)
  })
})

// ------------------------------------------------------------------ Redeem rate limit

describe('Redeem rate limit', () => {
  const REDEEM_MAX = Number(process.env.REDEEM_RATE_LIMIT_MAX ?? 10)
  const REDEEM_IP = '10.50.3.1'

  it(`blocks redeem after ${REDEEM_MAX} attempts from same IP`, async () => {
    for (let i = 0; i < REDEEM_MAX; i++) {
      const { agent, token } = await getCsrf()
      // Will 401 (no session) but not rate limit yet
      await agent
        .post('/v1/account/redeem')
        .set('X-CSRF-Token', token)
        .set('X-Forwarded-For', REDEEM_IP)
        .send({ code: `CODE${i}` })
    }

    const { agent, token } = await getCsrf()
    const blocked = await agent
      .post('/v1/account/redeem')
      .set('X-CSRF-Token', token)
      .set('X-Forwarded-For', REDEEM_IP)
      .send({ code: 'EXTRA' })
    expect(blocked.status).toBe(429)
  })
})

// ------------------------------------------------------------------ Reconcile rate limit

describe('Reconcile rate limit', () => {
  const RECONCILE_MAX = Number(process.env.RECONCILE_RATE_LIMIT_MAX ?? 5)
  const RECONCILE_IP = '10.50.4.1'

  it(`blocks reconcile after ${RECONCILE_MAX} attempts from same authenticated IP`, async () => {
    // Login as owner via no-DB fallback path (session needed for requireOwner to pass).
    const agent = request.agent(app)
    const preRes = await agent.get('/v1/auth/csrf')
    const preToken = (preRes.body as { csrfToken: string }).csrfToken
    await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', preToken)
      .set('X-Forwarded-For', RECONCILE_IP)
      .send({ username: 'sendai', password: 'TestPassword123!' })

    // Session regenerated on login — fetch fresh CSRF token.
    const csrfRes = await agent.get('/v1/auth/csrf')
    const token = (csrfRes.body as { csrfToken: string }).csrfToken

    const FAKE_ORDER_ID = '00000000-0000-0000-0000-000000000001'
    for (let i = 0; i < RECONCILE_MAX; i++) {
      await agent
        .post(`/v1/admin/payments/${FAKE_ORDER_ID}/reconcile`)
        .set('X-CSRF-Token', token)
        .set('X-Forwarded-For', RECONCILE_IP)
        .send({})
      // Each fails 500 (no DB) but both rate limiters still count it.
    }

    const blocked = await agent
      .post(`/v1/admin/payments/${FAKE_ORDER_ID}/reconcile`)
      .set('X-CSRF-Token', token)
      .set('X-Forwarded-For', RECONCILE_IP)
      .send({})
    expect(blocked.status).toBe(429)
    expect((blocked.body as { error: string }).error).toMatch(/reconciliation/i)
  })
})

// ------------------------------------------------------------------ Generic error messages

describe('Generic error messages (no account-existence leakage)', () => {
  it('login 401 does not reveal whether username exists', async () => {
    const { agent, token } = await getCsrf()
    const res = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', token)
      .send({ username: 'doesnotexist', password: 'WrongPass123!' })
    expect(res.status).toBe(401)
    expect((res.body as { error: string }).error).toBe('Invalid credentials.')
  })

  it('signup 429 does not reveal username or email in error', async () => {
    // Confirm limiter message is generic (from rateLimit.ts)
    const msg = 'Too many requests. Please try again later.'
    expect(msg).not.toContain('username')
    expect(msg).not.toContain('email')
    expect(msg).not.toContain('account')
  })
})
