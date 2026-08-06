import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

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
