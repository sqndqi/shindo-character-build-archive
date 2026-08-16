import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

// Credentials come from vitest.setup.ts. These tests exercise the no-database
// fallback path (DATABASE_URL is unset under test), which is where owner slots
// are resolved from env. With a database configured, both owners authenticate
// through the users table like any other account.
const PRIMARY_USERNAME = 'sendai'
const PRIMARY_PASSWORD = 'TestPassword123!'
const SECOND_USERNAME = 'secondowner'
const SECOND_PASSWORD = 'SecondPassword123!'

async function signIn(username: string, password: string) {
  const agent = request.agent(app)
  const csrfRes = await agent.get('/v1/auth/csrf')
  const csrfToken = (csrfRes.body as { csrfToken: string }).csrfToken
  const res = await agent
    .post('/v1/auth/login')
    .set('X-CSRF-Token', csrfToken)
    .send({ username, password })
  return { agent, res, csrfToken }
}

describe('second owner login', () => {
  it('signs in with its own credentials and reports role owner', async () => {
    const { res } = await signIn(SECOND_USERNAME, SECOND_PASSWORD)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-in')
    expect(res.body.role).toBe('owner')
    expect(res.body.fullArchive).toBe(true)
    expect(res.body.entitlement).toBe('active')
  })

  it('reports its own identity rather than the primary owner identity', async () => {
    const { res } = await signIn(SECOND_USERNAME, SECOND_PASSWORD)

    expect(res.body.username).toBe(SECOND_USERNAME)
    expect(res.body.email).toBe(`${SECOND_USERNAME}@archive.internal`)
    expect(res.body.username).not.toBe(PRIMARY_USERNAME)
  })

  it('is a distinct session identity from the primary owner', async () => {
    const primary = await signIn(PRIMARY_USERNAME, PRIMARY_PASSWORD)
    const second = await signIn(SECOND_USERNAME, SECOND_PASSWORD)

    expect(primary.res.body.userId).not.toBe(second.res.body.userId)
  })

  it('rejects the second owner username with the primary owner password', async () => {
    const { res } = await signIn(SECOND_USERNAME, PRIMARY_PASSWORD)
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })

  it('still rejects an unknown username', async () => {
    const { res } = await signIn('nottheowner', SECOND_PASSWORD)
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials.')
  })
})

describe('primary owner login remains unchanged', () => {
  it('signs in and keeps its historical session identity', async () => {
    const { res } = await signIn(PRIMARY_USERNAME, PRIMARY_PASSWORD)

    expect(res.status).toBe(200)
    expect(res.body.role).toBe('owner')
    expect(res.body.userId).toBe('owner')
    expect(res.body.username).toBe(PRIMARY_USERNAME)
    expect(res.body.fullArchive).toBe(true)
  })
})

describe('owner session state endpoints', () => {
  it('GET /v1/auth/me returns the second owner identity for its own session', async () => {
    const { agent } = await signIn(SECOND_USERNAME, SECOND_PASSWORD)
    const me = await agent.get('/v1/auth/me')

    expect(me.status).toBe(200)
    expect(me.body.role).toBe('owner')
    expect(me.body.username).toBe(SECOND_USERNAME)
    expect(me.body.fullArchive).toBe(true)
  })

  it('GET /v1/archive/access grants full archive to the second owner', async () => {
    const { agent } = await signIn(SECOND_USERNAME, SECOND_PASSWORD)
    const access = await agent.get('/v1/archive/access')

    expect(access.status).toBe(200)
    expect(access.body.status).toBe('signed-in')
    expect(access.body.role).toBe('owner')
    expect(access.body.fullArchive).toBe(true)
    expect(access.body.username).toBe(SECOND_USERNAME)
  })

  it('grants both owners identical archive privileges', async () => {
    const primaryAgent = (await signIn(PRIMARY_USERNAME, PRIMARY_PASSWORD)).agent
    const secondAgent = (await signIn(SECOND_USERNAME, SECOND_PASSWORD)).agent

    const primaryAccess = await primaryAgent.get('/v1/archive/access')
    const secondAccess = await secondAgent.get('/v1/archive/access')

    expect(secondAccess.body.role).toBe(primaryAccess.body.role)
    expect(secondAccess.body.fullArchive).toBe(primaryAccess.body.fullArchive)
    expect(secondAccess.body.entitlement).toBe(primaryAccess.body.entitlement)
    expect(secondAccess.body.highestPackage).toBe(primaryAccess.body.highestPackage)
  })
})

describe('owner-gated routes admit both owners', () => {
  // requireOwner returns 403 for non-owners. Both owner sessions must clear that
  // gate; whatever the handler does next (including a DB-dependent failure in
  // this no-database environment) is not an authorization outcome.
  async function adminStatus(username: string, password: string): Promise<number> {
    const { agent } = await signIn(username, password)
    const res = await agent.get('/v1/admin/users')
    return res.status
  }

  it('does not return 403 for the primary owner', async () => {
    expect(await adminStatus(PRIMARY_USERNAME, PRIMARY_PASSWORD)).not.toBe(403)
  })

  it('does not return 403 for the second owner', async () => {
    expect(await adminStatus(SECOND_USERNAME, SECOND_PASSWORD)).not.toBe(403)
  })

  it('returns 403 for an anonymous request', async () => {
    const res = await request(app).get('/v1/admin/users')
    expect(res.status).toBe(403)
  })

  it('treats both owners identically at the authorization boundary', async () => {
    const primary = await adminStatus(PRIMARY_USERNAME, PRIMARY_PASSWORD)
    const second = await adminStatus(SECOND_USERNAME, SECOND_PASSWORD)
    expect(second).toBe(primary)
  })
})
