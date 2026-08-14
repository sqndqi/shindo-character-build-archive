/**
 * Tests for POST /v1/auth/clerk-session
 *
 * Mocks: @clerk/express (getAuth), ../src/db/index (query), and
 * ../src/services/clerkUserResolver (resolveClerkUser, ClerkResolverError).
 * No network calls, no real Clerk credentials.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// vi.hoisted runs before all vi.mock() factories, making the class available
// in both the factory closures and the test body.
const MockClerkResolverError = vi.hoisted(() => {
  class ClerkResolverError extends Error {
    code: 'ACCOUNT_LINK_REQUIRED' | 'ACCOUNT_SUSPENDED' | 'PROVISIONING_FAILED'
    constructor(
      code: 'ACCOUNT_LINK_REQUIRED' | 'ACCOUNT_SUSPENDED' | 'PROVISIONING_FAILED',
      message: string,
    ) {
      super(message)
      this.code = code
      this.name = 'ClerkResolverError'
    }
  }
  return ClerkResolverError
})

// ------------------------------------------------------------------ mocks

vi.mock('@clerk/express', () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: vi.fn().mockReturnValue({ userId: null }),
  clerkClient: { users: { getUser: vi.fn() } },
}))

vi.mock('../src/db/index', () => ({
  query: vi.fn(),
  withTransaction: vi.fn(),
  auditLog: vi.fn(),
}))

vi.mock('../src/services/clerkUserResolver', () => ({
  resolveClerkUser: vi.fn(),
  ClerkResolverError: MockClerkResolverError,
}))

// ------------------------------------------------------------------ imports (after mocks)

import request from 'supertest'
import { getAuth } from '@clerk/express'
import { query } from '../src/db/index'
import { resolveClerkUser } from '../src/services/clerkUserResolver'
import { app } from '../src/app'

const mockGetAuth = vi.mocked(getAuth)
const mockQuery = vi.mocked(query)
const mockResolveClerkUser = vi.mocked(resolveClerkUser)

// ------------------------------------------------------------------ fixtures

const CLERK_USER_ID = 'user_2abc1234567890abcdef12345678'
const LOCAL_USER_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

const resolvedUser = {
  id: LOCAL_USER_ID,
  username: 'ck_testuser',
  email: 'clerk@example.com',
  role: 'user' as const,
  status: 'active',
}

const dbUser = {
  id: LOCAL_USER_ID,
  username: 'ck_testuser',
  email: 'clerk@example.com',
  role: 'user',
  status: 'active',
}

async function withCsrf(): Promise<{ agent: ReturnType<typeof request.agent>; csrfToken: string }> {
  const agent = request.agent(app)
  const res = await agent.get('/v1/auth/csrf')
  return { agent, csrfToken: (res.body as { csrfToken: string }).csrfToken }
}

function setupSuccessQueries() {
  mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }) // UPDATE last_login_at
  mockQuery.mockResolvedValueOnce({ rows: [dbUser], rowCount: 1 }) // buildAccessState: user
  mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // buildAccessState: entitlements
}

// ------------------------------------------------------------------ setup / teardown

beforeEach(() => {
  vi.resetAllMocks()
  mockGetAuth.mockReturnValue({ userId: null } as never)
  // Make dbAvailable() return true (query is mocked — URL never used for connection)
  process.env.DATABASE_URL = 'postgres://test-not-used:5432/testdb'
})

afterEach(() => {
  delete process.env.DATABASE_URL
})

// ------------------------------------------------------------------ unauthenticated

describe('POST /v1/auth/clerk-session — unauthenticated', () => {
  it('returns 401 CLERK_AUTH_REQUIRED when Clerk session is absent', async () => {
    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('CLERK_AUTH_REQUIRED')
    expect(mockResolveClerkUser).not.toHaveBeenCalled()
  })

  it('returns 401 even when req.body contains a userId (body must not be trusted)', async () => {
    mockGetAuth.mockReturnValue({ userId: null } as never)
    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({ userId: CLERK_USER_ID })

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('CLERK_AUTH_REQUIRED')
    expect(mockResolveClerkUser).not.toHaveBeenCalled()
  })
})

// ------------------------------------------------------------------ userId source integrity

describe('POST /v1/auth/clerk-session — userId source integrity', () => {
  it('resolveClerkUser called with getAuth(req).userId, not req.body.userId', async () => {
    const attackerBodyId = 'user_ATTACKER_INJECTED_ID'
    mockGetAuth.mockReturnValue({ userId: CLERK_USER_ID } as never)
    mockResolveClerkUser.mockResolvedValueOnce(resolvedUser)
    setupSuccessQueries()

    const { agent, csrfToken } = await withCsrf()
    await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({ userId: attackerBodyId })

    expect(mockResolveClerkUser).toHaveBeenCalledWith(CLERK_USER_ID)
    expect(mockResolveClerkUser).not.toHaveBeenCalledWith(attackerBodyId)
  })
})

// ------------------------------------------------------------------ successful session

describe('POST /v1/auth/clerk-session — success', () => {
  it('returns 200 with ArchiveAccessState shape', async () => {
    mockGetAuth.mockReturnValue({ userId: CLERK_USER_ID } as never)
    mockResolveClerkUser.mockResolvedValueOnce(resolvedUser)
    setupSuccessQueries()

    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-in')
    expect(typeof res.body.userId).toBe('string')
    expect(typeof res.body.username).toBe('string')
    expect(typeof res.body.email).toBe('string')
    expect(typeof res.body.role).toBe('string')
    expect(typeof res.body.entitlement).toBe('string')
    expect(Array.isArray(res.body.freeCharacterIds)).toBe(true)
    expect(Array.isArray(res.body.characterIds)).toBe(true)
    expect(typeof res.body.fullArchive).toBe('boolean')
  })

  it('session stores LOCAL users.id — GET /me returns signed-in after Clerk login', async () => {
    mockGetAuth.mockReturnValue({ userId: CLERK_USER_ID } as never)
    mockResolveClerkUser.mockResolvedValueOnce(resolvedUser)
    setupSuccessQueries()

    const { agent, csrfToken } = await withCsrf()
    await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})
      .expect(200)

    // /me calls buildAccessState — queue its queries
    mockQuery.mockResolvedValueOnce({ rows: [dbUser], rowCount: 1 })
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const meRes = await agent.get('/v1/auth/me')
    expect(meRes.status).toBe(200)
    expect(meRes.body.status).toBe('signed-in')
    expect(meRes.body.userId).toBe(LOCAL_USER_ID)
  })

  it('session stores LOCAL role from resolved users row', async () => {
    const modUser = { ...resolvedUser, role: 'moderator' as const }
    const modDbUser = { ...dbUser, role: 'moderator' }
    mockGetAuth.mockReturnValue({ userId: CLERK_USER_ID } as never)
    mockResolveClerkUser.mockResolvedValueOnce(modUser)
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 })
    mockQuery.mockResolvedValueOnce({ rows: [modDbUser], rowCount: 1 })
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 })

    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})

    expect(res.status).toBe(200)
    expect(res.body.role).toBe('moderator')
  })

  it('response does not expose clerk_id', async () => {
    mockGetAuth.mockReturnValue({ userId: CLERK_USER_ID } as never)
    mockResolveClerkUser.mockResolvedValueOnce(resolvedUser)
    setupSuccessQueries()

    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})

    expect(res.body).not.toHaveProperty('clerk_id')
    expect(res.body).not.toHaveProperty('clerkId')
  })
})

// ------------------------------------------------------------------ error mapping

describe('POST /v1/auth/clerk-session — error mapping', () => {
  beforeEach(() => {
    mockGetAuth.mockReturnValue({ userId: CLERK_USER_ID } as never)
  })

  it('ACCOUNT_LINK_REQUIRED => 409, no session established', async () => {
    mockResolveClerkUser.mockRejectedValueOnce(
      new MockClerkResolverError('ACCOUNT_LINK_REQUIRED', 'Email already exists.'),
    )

    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})

    expect(res.status).toBe(409)
    expect(res.body.code).toBe('ACCOUNT_LINK_REQUIRED')

    const meRes = await agent.get('/v1/auth/me')
    expect(meRes.body.status).toBe('signed-out')
  })

  it('ACCOUNT_SUSPENDED => 403, no session established', async () => {
    mockResolveClerkUser.mockRejectedValueOnce(
      new MockClerkResolverError('ACCOUNT_SUSPENDED', 'Account suspended.'),
    )

    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})

    expect(res.status).toBe(403)
    expect(res.body.code).toBe('ACCOUNT_SUSPENDED')

    const meRes = await agent.get('/v1/auth/me')
    expect(meRes.body.status).toBe('signed-out')
  })

  it('PROVISIONING_FAILED => 500, no session established', async () => {
    mockResolveClerkUser.mockRejectedValueOnce(
      new MockClerkResolverError('PROVISIONING_FAILED', 'Retry.'),
    )

    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})

    expect(res.status).toBe(500)
    expect(res.body.code).toBe('PROVISIONING_FAILED')

    const meRes = await agent.get('/v1/auth/me')
    expect(meRes.body.status).toBe('signed-out')
  })

  it('unexpected resolver error => generic 500, no internal details leaked', async () => {
    mockResolveClerkUser.mockRejectedValueOnce(new Error('pg: connection refused'))

    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})

    expect(res.status).toBe(500)
    expect(res.body.error).not.toContain('pg: connection refused')
    expect(res.body.code).toBeUndefined()
  })
})

// ------------------------------------------------------------------ DATABASE_URL unavailable

describe('POST /v1/auth/clerk-session — missing DATABASE_URL', () => {
  it('returns 503 cleanly without calling resolveClerkUser', async () => {
    delete process.env.DATABASE_URL
    mockGetAuth.mockReturnValue({ userId: CLERK_USER_ID } as never)

    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/clerk-session')
      .set('X-CSRF-Token', csrfToken)
      .send({})

    expect(res.status).toBe(503)
    expect(mockResolveClerkUser).not.toHaveBeenCalled()
  })
})

// ------------------------------------------------------------------ CSRF guard

describe('POST /v1/auth/clerk-session — CSRF enforced', () => {
  it('returns 403 when X-CSRF-Token header is absent', async () => {
    mockGetAuth.mockReturnValue({ userId: CLERK_USER_ID } as never)

    const res = await request(app)
      .post('/v1/auth/clerk-session')
      .send({})

    expect(res.status).toBe(403)
    expect(mockResolveClerkUser).not.toHaveBeenCalled()
  })
})

// ------------------------------------------------------------------ legacy route regressions

describe('Legacy auth routes — regression (no DATABASE_URL)', () => {
  beforeEach(() => {
    delete process.env.DATABASE_URL
  })

  it('POST /login still works with valid owner credentials', async () => {
    const { agent, csrfToken } = await withCsrf()
    const res = await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ username: 'sendai', password: 'TestPassword123!' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-in')
    expect(res.body.fullArchive).toBe(true)
  })

  it('POST /logout still works after owner login', async () => {
    const { agent, csrfToken } = await withCsrf()
    await agent
      .post('/v1/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ username: 'sendai', password: 'TestPassword123!' })
      .expect(200)

    const freshCsrf = (await agent.get('/v1/auth/csrf')).body as { csrfToken: string }
    const logoutRes = await agent
      .post('/v1/auth/logout')
      .set('X-CSRF-Token', freshCsrf.csrfToken)
    expect(logoutRes.status).toBe(200)

    const meRes = await agent.get('/v1/auth/me')
    expect(meRes.body.status).toBe('signed-out')
  })

  it('GET /me returns signed-out with no session', async () => {
    const res = await request(app).get('/v1/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('signed-out')
  })
})
