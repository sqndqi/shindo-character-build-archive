import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app, createApp } from '../src/app'

const VALID_USERNAME = 'sendai'
const VALID_PASSWORD = 'TestPassword123!'
const WRONG_PASSWORD = 'WrongPassword!'
const UNKNOWN_USERNAME = 'nottheowner'

describe('POST /v1/auth/login', () => {
  it('returns signed-in state with fullArchive on valid credentials', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-in')
    expect(res.body.fullArchive).toBe(true)
    expect(res.body.entitlement).toBe('active')
  })

  it('returns 401 with generic message on wrong password', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ username: VALID_USERNAME, password: WRONG_PASSWORD })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })

  it('returns 401 with generic message on unknown username', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ username: UNKNOWN_USERNAME, password: VALID_PASSWORD })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })
})

describe('POST /v1/auth/logout', () => {
  it('destroys session and returns 200', async () => {
    const agent = request.agent(app)
    await agent
      .post('/v1/auth/login')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
      .expect(200)

    const logoutRes = await agent.post('/v1/auth/logout')
    expect(logoutRes.status).toBe(200)

    const meRes = await agent.get('/v1/auth/me')
    expect(meRes.body.status).toBe('signed-out')
  })
})

describe('GET /v1/auth/me', () => {
  it('returns signed-in state when session is active', async () => {
    const agent = request.agent(app)
    await agent
      .post('/v1/auth/login')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })

    const res = await agent.get('/v1/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-in')
    expect(res.body.fullArchive).toBe(true)
  })

  it('returns signed-out when no session', async () => {
    const res = await request(app).get('/v1/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-out')
  })
})

describe('GET /v1/archive/access', () => {
  it('returns fullArchive: true for authenticated owner', async () => {
    const agent = request.agent(app)
    await agent
      .post('/v1/auth/login')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })

    const res = await agent.get('/v1/archive/access')
    expect(res.status).toBe(200)
    expect(res.body.fullArchive).toBe(true)
  })

  it('returns signed-out for unauthenticated request', async () => {
    const res = await request(app).get('/v1/archive/access')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-out')
  })
})

describe('Rate limiting', () => {
  // Use a unique X-Forwarded-For IP so this test is isolated from other failed attempts.
  // trust proxy: 1 is set in app, so X-Forwarded-For overrides the IP.
  const RATE_TEST_IP = '10.99.0.1'
  const MAX = Number(process.env.RATE_LIMIT_MAX ?? 3)

  it(`blocks login after ${MAX} failed attempts from the same IP`, async () => {
    for (let i = 0; i < MAX; i++) {
      await request(app)
        .post('/v1/auth/login')
        .set('X-Forwarded-For', RATE_TEST_IP)
        .send({ username: UNKNOWN_USERNAME, password: WRONG_PASSWORD })
        .expect(401)
    }

    const blocked = await request(app)
      .post('/v1/auth/login')
      .set('X-Forwarded-For', RATE_TEST_IP)
      .send({ username: UNKNOWN_USERNAME, password: WRONG_PASSWORD })
    expect(blocked.status).toBe(429)
  })
})

describe('CORS', () => {
  it('does not include Access-Control-Allow-Origin for disallowed origin', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .set('Origin', 'https://malicious.example.com')
      .send({ username: VALID_USERNAME, password: WRONG_PASSWORD })
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('Cookie attributes', () => {
  // Isolated IPs so the shared in-memory rate limiter never blocks these tests.
  it('production app sets SameSite=None and Secure on login cookie', async () => {
    const prodApp = createApp({ sameSite: 'none', secure: true })
    // X-Forwarded-Proto: https makes req.secure=true via trust proxy: 1,
    // which is required for express-session to emit the Set-Cookie header
    // when secure:true is configured.
    const res = await request(prodApp)
      .post('/v1/auth/login')
      .set('X-Forwarded-For', '10.88.1.1')
      .set('X-Forwarded-Proto', 'https')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
    expect(res.status).toBe(200)
    const cookie = (res.headers['set-cookie'] as string[] | undefined)?.[0] ?? ''
    expect(cookie.toLowerCase()).toContain('samesite=none')
    expect(cookie.toLowerCase()).toContain('secure')
    expect(cookie.toLowerCase()).toContain('httponly')
  })

  it('development app sets SameSite=Lax and no Secure flag on login cookie', async () => {
    const devApp = createApp({ sameSite: 'lax', secure: false })
    const res = await request(devApp)
      .post('/v1/auth/login')
      .set('X-Forwarded-For', '10.88.1.2')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
    expect(res.status).toBe(200)
    const cookie = (res.headers['set-cookie'] as string[] | undefined)?.[0] ?? ''
    expect(cookie.toLowerCase()).toContain('samesite=lax')
    expect(cookie.toLowerCase()).not.toContain('secure')
    expect(cookie.toLowerCase()).toContain('httponly')
  })
})

describe('GET /health', () => {
  it('returns ok: true without authentication (used to distinguish cold-start from 401)', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})

describe('Full auth flow', () => {
  // Isolated IPs per test so the shared in-memory rate limiter never blocks these.
  it('valid sendai login grants fullArchive access', async () => {
    const agent = request.agent(app)
    const loginRes = await agent
      .post('/v1/auth/login')
      .set('X-Forwarded-For', '10.88.2.1')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
    expect(loginRes.status).toBe(200)
    expect(loginRes.body.fullArchive).toBe(true)

    const accessRes = await agent.get('/v1/archive/access')
    expect(accessRes.body.fullArchive).toBe(true)
    expect(accessRes.body.status).toBe('signed-in')
  })

  it('logout relocks archive access', async () => {
    const agent = request.agent(app)
    await agent
      .post('/v1/auth/login')
      .set('X-Forwarded-For', '10.88.2.2')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
      .expect(200)

    await agent.post('/v1/auth/logout').expect(200)

    const accessRes = await agent.get('/v1/archive/access')
    expect(accessRes.body.status).toBe('signed-out')
    expect(accessRes.body.fullArchive).toBeUndefined()
  })

  it('signed-out /archive/access never exposes fullArchive', async () => {
    const res = await request(app).get('/v1/archive/access')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-out')
    expect(res.body.fullArchive).toBeUndefined()
  })

  it('invalid credentials return generic 401 (not a cold-start 503 or network error)', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .set('X-Forwarded-For', '10.88.2.3')
      .send({ username: VALID_USERNAME, password: WRONG_PASSWORD })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })
})
