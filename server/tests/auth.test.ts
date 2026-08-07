import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app, createApp } from '../src/app'

const VALID_USERNAME = 'sendai'
const VALID_PASSWORD = 'TestPassword123!'
const WRONG_PASSWORD = 'WrongPassword!'
const UNKNOWN_USERNAME = 'nottheowner'

// Creates a cookie-persistent agent and pre-fetches a CSRF token so POST requests pass validation.
async function withCsrf(targetApp = app): Promise<{
  agent: ReturnType<typeof request.agent>
  csrfToken: string
}> {
  const agent = request.agent(targetApp)
  const res = await agent.get('/v1/auth/csrf')
  return { agent, csrfToken: (res.body as { csrfToken: string }).csrfToken }
}

describe('POST /v1/auth/login', () => {
  it('returns signed-in state with fullArchive on valid credentials', async () => {
    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-in')
    expect(res.body.fullArchive).toBe(true)
    expect(res.body.entitlement).toBe('active')
  })

  it('returns 401 with generic message on wrong password', async () => {
    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ username: VALID_USERNAME, password: WRONG_PASSWORD })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })

  it('returns 401 with generic message on unknown username', async () => {
    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ username: UNKNOWN_USERNAME, password: VALID_PASSWORD })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })
})

describe('POST /v1/auth/logout', () => {
  it('destroys session and returns 200', async () => {
    const { agent, csrfToken } = await withCsrf()
    await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
      .expect(200)

    // Login regenerates the session — fetch a fresh CSRF token for the new session
    const newCsrfRes = await agent.get('/v1/auth/csrf')
    const newCsrfToken = (newCsrfRes.body as { csrfToken: string }).csrfToken

    const logoutRes = await agent.post('/v1/auth/logout').set('X-CSRF-Token', newCsrfToken)
    expect(logoutRes.status).toBe(200)

    const meRes = await agent.get('/v1/auth/me')
    expect(meRes.body.status).toBe('signed-out')
  })
})

describe('GET /v1/auth/me', () => {
  it('returns signed-in state when session is active', async () => {
    const { agent, csrfToken } = await withCsrf()
    await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
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
    const { agent, csrfToken } = await withCsrf()
    await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
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

  // Regression: hotfix for crash — signed-out response must include all fields
  it('signed-out response includes freeCharacterIds array of 5 free builds', async () => {
    const res = await request(app).get('/v1/archive/access')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.freeCharacterIds)).toBe(true)
    expect(res.body.freeCharacterIds).toHaveLength(5)
    expect(res.body.freeCharacterIds).toContain('zack-lee')
    expect(res.body.freeCharacterIds).toContain('vasco')
    expect(res.body.freeCharacterIds).toContain('gray-yeon')
    expect(res.body.freeCharacterIds).toContain('yu')
    expect(res.body.freeCharacterIds).toContain('jin-mori')
  })

  it('signed-out response includes characterIds: [] and fullArchive: false', async () => {
    const res = await request(app).get('/v1/archive/access')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.characterIds)).toBe(true)
    expect(res.body.characterIds).toHaveLength(0)
    expect(res.body.fullArchive).toBe(false)
    expect(res.body.highestPackage).toBeNull()
  })

  it('signed-in response also includes freeCharacterIds array of 5', async () => {
    const { agent, csrfToken } = await withCsrf()
    await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .set('X-Forwarded-For', '10.88.3.1')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })

    const res = await agent.get('/v1/archive/access')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-in')
    expect(Array.isArray(res.body.freeCharacterIds)).toBe(true)
    expect(res.body.freeCharacterIds).toHaveLength(5)
    expect(Array.isArray(res.body.characterIds)).toBe(true)
    expect(res.body.fullArchive).toBe(true)
  })
})

describe('Rate limiting', () => {
  const RATE_TEST_IP = '10.99.0.1'
  const MAX = Number(process.env.RATE_LIMIT_MAX ?? 3)

  it(`blocks login after ${MAX} failed attempts from the same IP`, async () => {
    for (let i = 0; i < MAX; i++) {
      const { agent, csrfToken } = await withCsrf()
      await agent
        .post('/v1/auth/login')
        .set('X-CSRF-Token', csrfToken)
        .set('X-Forwarded-For', RATE_TEST_IP)
        .send({ username: UNKNOWN_USERNAME, password: WRONG_PASSWORD })
        .expect(401)
    }

    const { agent, csrfToken } = await withCsrf()
    const blocked = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .set('X-Forwarded-For', RATE_TEST_IP)
      .send({ username: UNKNOWN_USERNAME, password: WRONG_PASSWORD })
    expect(blocked.status).toBe(429)
  })
})

describe('CORS', () => {
  it('does not include Access-Control-Allow-Origin for disallowed origin', async () => {
    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .set('Origin', 'https://malicious.example.com')
      .send({ username: VALID_USERNAME, password: WRONG_PASSWORD })
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('Cookie attributes', () => {
  it('production app sets SameSite=None and Secure on session cookie', async () => {
    const prodApp = createApp({ sameSite: 'none', secure: true })
    const agent = request.agent(prodApp)
    // tough-cookie won't resend a Secure cookie over HTTP, so we can't round-trip through login.
    // Instead check the Set-Cookie from the CSRF endpoint — same session middleware, same attributes.
    const csrfRes = await agent.get('/v1/auth/csrf').set('X-Forwarded-Proto', 'https')
    const cookieHeader = csrfRes.headers['set-cookie']
    const cookie = (Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader) ?? ''
    expect(cookie.toLowerCase()).toContain('samesite=none')
    expect(cookie.toLowerCase()).toContain('secure')
    expect(cookie.toLowerCase()).toContain('httponly')
  })

  it('development app sets SameSite=Lax and no Secure flag on login cookie', async () => {
    const devApp = createApp({ sameSite: 'lax', secure: false })
    const { agent, csrfToken } = await withCsrf(devApp)
    const res = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .set('X-Forwarded-For', '10.88.1.2')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
    expect(res.status).toBe(200)
    const cookieHeader = res.headers['set-cookie']
    const cookie = (Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader) ?? ''
    expect(cookie.toLowerCase()).toContain('samesite=lax')
    expect(cookie.toLowerCase()).not.toContain('secure')
    expect(cookie.toLowerCase()).toContain('httponly')
  })
})

describe('GET /health', () => {
  it('returns ok: true without authentication', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})

describe('Full auth flow', () => {
  it('valid sendai login grants fullArchive access', async () => {
    const { agent, csrfToken } = await withCsrf()
    const loginRes = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .set('X-Forwarded-For', '10.88.2.1')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
    expect(loginRes.status).toBe(200)
    expect(loginRes.body.fullArchive).toBe(true)

    const accessRes = await agent.get('/v1/archive/access')
    expect(accessRes.body.fullArchive).toBe(true)
    expect(accessRes.body.status).toBe('signed-in')
  })

  it('logout relocks archive access', async () => {
    const { agent, csrfToken } = await withCsrf()
    await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .set('X-Forwarded-For', '10.88.2.2')
      .send({ username: VALID_USERNAME, password: VALID_PASSWORD })
      .expect(200)

    // Login regenerates the session — fetch fresh CSRF token for new session
    const freshCsrf = (await agent.get('/v1/auth/csrf')).body as { csrfToken: string }
    await agent.post('/v1/auth/logout').set('X-CSRF-Token', freshCsrf.csrfToken).expect(200)

    const accessRes = await agent.get('/v1/archive/access')
    expect(accessRes.body.status).toBe('signed-out')
    expect(accessRes.body.fullArchive).toBe(false)
  })

  it('signed-out /archive/access returns fullArchive: false, never exposes premium data', async () => {
    const res = await request(app).get('/v1/archive/access')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-out')
    expect(res.body.fullArchive).toBe(false)
  })

  it('invalid credentials return generic 401', async () => {
    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .set('X-Forwarded-For', '10.88.2.3')
      .send({ username: VALID_USERNAME, password: WRONG_PASSWORD })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })
})
