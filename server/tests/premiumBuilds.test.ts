import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

// Mock the private catalog so tests do not depend on the generated JSON file.
vi.mock('../src/premiumCatalog', () => {
  const builds: Record<string, unknown> = {
    'gun-park': { id: 'gun-park', name: 'Gun Park', variants: [{ id: 'v1' }] },
    'james-lee': { id: 'james-lee', name: 'James Lee', variants: [{ id: 'v1' }] },
    'zack-lee': { id: 'zack-lee', name: 'Zack Lee', variants: [{ id: 'v1' }] },
  }
  return {
    getPremiumBuild: (id: string) => builds[id] ?? null,
    hasPremiumBuild: (id: string) => id in builds,
    premiumCatalogSize: () => Object.keys(builds).length,
  }
})

// Mock the DB layer. isAuthorizedForBuild uses query(); the no-DB app paths do not.
vi.mock('../src/db/index', () => ({
  query: vi.fn(),
  getPool: vi.fn(),
  withTransaction: vi.fn(),
  auditLog: vi.fn(),
}))

import { query } from '../src/db/index'
import { isAuthorizedForBuild } from '../src/routes/archive'
import { app } from '../src/app'

const mockQuery = vi.mocked(query)
const USER = 'a1b2c3d4-0000-0000-0000-000000000001'

function withUserAndEntitlements(
  user: { status: string } | null,
  entitlements: { entitlement_type: string; resource_mapping: Record<string, unknown> }[],
) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/FROM users/.test(sql)) return { rows: user ? [{ id: USER, status: user.status }] : [], rowCount: user ? 1 : 0 }
    if (/FROM entitlements/.test(sql)) return { rows: entitlements, rowCount: entitlements.length }
    return { rows: [], rowCount: 0 }
  })
}

beforeEach(() => vi.resetAllMocks())

// ---------------------------------------------- entitlement authorization matrix

describe('isAuthorizedForBuild — server-side entitlement matrix', () => {
  it('single-character entitlement allows its own id and denies another', async () => {
    withUserAndEntitlements({ status: 'active' }, [
      { entitlement_type: 'character', resource_mapping: { characterId: 'gun-park' } },
    ])
    expect(await isAuthorizedForBuild(USER, 'gun-park')).toBe(true)

    withUserAndEntitlements({ status: 'active' }, [
      { entitlement_type: 'character', resource_mapping: { characterId: 'gun-park' } },
    ])
    expect(await isAuthorizedForBuild(USER, 'james-lee')).toBe(false)
  })

  it('pack entitlement allows every id inside the pack and denies others', async () => {
    const pack = [{ entitlement_type: 'pack', resource_mapping: { characterIds: ['gun-park', 'james-lee'] } }]
    withUserAndEntitlements({ status: 'active' }, pack)
    expect(await isAuthorizedForBuild(USER, 'gun-park')).toBe(true)
    withUserAndEntitlements({ status: 'active' }, pack)
    expect(await isAuthorizedForBuild(USER, 'james-lee')).toBe(true)
    withUserAndEntitlements({ status: 'active' }, pack)
    expect(await isAuthorizedForBuild(USER, 'kitae-kim')).toBe(false)
  })

  it('full_archive entitlement allows any premium build (owner path)', async () => {
    withUserAndEntitlements({ status: 'active' }, [
      { entitlement_type: 'full_archive', resource_mapping: {} },
    ])
    expect(await isAuthorizedForBuild(USER, 'gun-park')).toBe(true)
  })

  it('no active entitlement rows (covers revoked/expired, filtered by SQL) => denied', async () => {
    withUserAndEntitlements({ status: 'active' }, [])
    expect(await isAuthorizedForBuild(USER, 'gun-park')).toBe(false)
  })

  it('suspended account is denied even with a matching entitlement', async () => {
    withUserAndEntitlements({ status: 'suspended' }, [
      { entitlement_type: 'character', resource_mapping: { characterId: 'gun-park' } },
    ])
    expect(await isAuthorizedForBuild(USER, 'gun-park')).toBe(false)
  })

  it('missing user is denied', async () => {
    withUserAndEntitlements(null, [])
    expect(await isAuthorizedForBuild(USER, 'gun-park')).toBe(false)
  })

  it('entitlement query filters revoked/expired via WHERE (status active + expiry)', async () => {
    withUserAndEntitlements({ status: 'active' }, [])
    await isAuthorizedForBuild(USER, 'gun-park')
    const entSql = mockQuery.mock.calls.map((c) => String(c[0])).find((s) => /FROM entitlements/.test(s)) ?? ''
    expect(entSql).toMatch(/status = 'active'/)
    expect(entSql).toMatch(/expires_at IS NULL OR expires_at > NOW\(\)/)
  })
})

// ---------------------------------------------------------------- HTTP endpoint

describe('GET /v1/archive/builds/:id', () => {
  async function ownerAgent() {
    const agent = request.agent(app)
    const csrf = (await agent.get('/v1/auth/csrf')).body.csrfToken
    await agent.post('/v1/auth/login').set('X-CSRF-Token', csrf).send({ username: 'sendai', password: 'TestPassword123!' })
    return agent
  }

  it('401 for a signed-out request to a premium build', async () => {
    const res = await request(app).get('/v1/archive/builds/gun-park')
    expect(res.status).toBe(401)
  })

  it('does not leak whether the premium build exists when signed out (still 401)', async () => {
    const real = await request(app).get('/v1/archive/builds/gun-park')
    const fake = await request(app).get('/v1/archive/builds/some-unwritten-id')
    expect(real.status).toBe(401)
    expect(fake.status).toBe(401)
  })

  it('a signed-out client cannot spoof ownership via query/body', async () => {
    const res = await request(app)
      .get('/v1/archive/builds/gun-park?fullArchive=true&characterIds=gun-park')
      .send({ fullArchive: true })
    expect(res.status).toBe(401)
  })

  it('404 for a malformed build id (no DB touch, no enumeration)', async () => {
    const res = await request(app).get('/v1/archive/builds/Gun_Park')
    expect(res.status).toBe(404)
  })

  it('serves a free build without authentication', async () => {
    const res = await request(app).get('/v1/archive/builds/zack-lee')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('zack-lee')
  })

  it('owner (full archive via fallback session) gets the full premium build', async () => {
    const agent = await ownerAgent()
    const res = await agent.get('/v1/archive/builds/gun-park')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('gun-park')
    expect(Array.isArray(res.body.variants)).toBe(true)
  })

  it('owner gets 404 for an authorized build not present in the catalog', async () => {
    const agent = await ownerAgent()
    const res = await agent.get('/v1/archive/builds/some-unwritten-id')
    expect(res.status).toBe(404)
  })
})
