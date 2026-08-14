import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock DB and Clerk before importing the module under test
vi.mock('../src/db/index', () => ({
  query: vi.fn(),
  withTransaction: vi.fn(),
}))

vi.mock('@clerk/express', () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  clerkClient: {
    users: {
      getUser: vi.fn(),
    },
  },
}))

import { query, withTransaction } from '../src/db/index'
import { clerkClient } from '@clerk/express'
import {
  resolveClerkUser,
  fallbackUsername,
  syntheticEmail,
  ClerkResolverError,
} from '../src/services/clerkUserResolver'

const mockQuery = vi.mocked(query)
const mockWithTransaction = vi.mocked(withTransaction)
const mockGetUser = vi.mocked(clerkClient.users.getUser)

const CLERK_ID = 'user_2abc1234567890abcdef12345678'
const LOCAL_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

function makeClerkUser(overrides: { username?: string | null; email?: string | null } = {}) {
  // Use 'in' to distinguish explicit null from absent key
  const email = 'email' in overrides ? overrides.email : 'test@example.com'
  return {
    id: CLERK_ID,
    username: overrides.username ?? null,
    primaryEmailAddressId: email ? 'eid_1' : null,
    emailAddresses: email ? [{ id: 'eid_1', emailAddress: email }] : [],
  }
}

beforeEach(() => {
  vi.resetAllMocks()
})

// ------------------------------------------------------------------ unit helpers

describe('fallbackUsername', () => {
  it('returns ck_ + 24 hex chars = 27 chars total', () => {
    const u = fallbackUsername(CLERK_ID)
    expect(u).toMatch(/^ck_[0-9a-f]{24}$/)
    expect(u.length).toBe(27)
  })

  it('is deterministic for same input', () => {
    expect(fallbackUsername(CLERK_ID)).toBe(fallbackUsername(CLERK_ID))
  })

  it('differs for different Clerk IDs', () => {
    expect(fallbackUsername(CLERK_ID)).not.toBe(fallbackUsername('user_zzzzzzzzz'))
  })

  it('passes username validation constraints (alphanum/_ max 30)', () => {
    const u = fallbackUsername(CLERK_ID)
    expect(u.length).toBeLessThanOrEqual(30)
    expect(/^[a-zA-Z0-9_-]+$/.test(u)).toBe(true)
  })
})

describe('syntheticEmail', () => {
  it('ends with @internal.invalid', () => {
    expect(syntheticEmail(CLERK_ID)).toMatch(/@internal\.invalid$/)
  })

  it('is deterministic', () => {
    expect(syntheticEmail(CLERK_ID)).toBe(syntheticEmail(CLERK_ID))
  })
})

// ------------------------------------------------------------------ resolveClerkUser — fast path

describe('resolveClerkUser — fast path (clerk_id exists)', () => {
  it('returns existing local user without calling Clerk API', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: LOCAL_ID, username: 'existing', email: 'ex@example.com', role: 'user', status: 'active' }],
      rowCount: 1,
    })

    const result = await resolveClerkUser(CLERK_ID)

    expect(result.id).toBe(LOCAL_ID)
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  it('throws ACCOUNT_SUSPENDED if mapped account is suspended', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: LOCAL_ID, username: 'existing', email: 'ex@example.com', role: 'user', status: 'suspended' }],
      rowCount: 1,
    })

    await expect(resolveClerkUser(CLERK_ID)).rejects.toMatchObject({ code: 'ACCOUNT_SUSPENDED' })
    expect(mockGetUser).not.toHaveBeenCalled()
  })
})

// ------------------------------------------------------------------ provisioning

describe('resolveClerkUser — new Clerk identity provisioning', () => {
  it('provisions new local user; INSERT uses literal NULL for password_hash', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup: miss
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ email: 'new@example.com' }) as never)
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email: no conflict

    const capturedSql: string[] = []
    const capturedParams: unknown[][] = []

    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn().mockImplementation((sql: string, params: unknown[]) => {
          capturedSql.push(sql)
          capturedParams.push(params)
          return Promise.resolve({
            rows: [{ id: LOCAL_ID, username: fallbackUsername(CLERK_ID), email: 'new@example.com', role: 'user', status: 'active' }],
          })
        }),
      }
      return fn(fakeClient as never)
    })

    const result = await resolveClerkUser(CLERK_ID)
    expect(result.id).toBe(LOCAL_ID)
    // SQL has literal NULL — params are [username, email, clerk_id] (3 values)
    expect(capturedParams[0]).toHaveLength(3)
    expect(capturedSql[0]).toContain('NULL')
    expect(capturedSql[0]).toContain('ON CONFLICT (clerk_id) DO NOTHING')
    expect(capturedParams[0][2]).toBe(CLERK_ID)
  })

  it('uses Clerk username when valid and non-conflicting', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ username: 'validuser', email: 'u@example.com' }) as never)
    mockQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email: no conflict
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // username: no conflict

    let insertedUsername = ''
    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn().mockImplementation((_sql: string, params: unknown[]) => {
          insertedUsername = params[0] as string
          return Promise.resolve({
            rows: [{ id: LOCAL_ID, username: 'validuser', email: 'u@example.com', role: 'user', status: 'active' }],
          })
        }),
      }
      return fn(fakeClient as never)
    })

    await resolveClerkUser(CLERK_ID)
    expect(insertedUsername).toBe('validuser')
  })

  it('falls back to 27-char hash-derived username when Clerk username absent', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ username: null, email: 'u@example.com' }) as never)
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email: no conflict

    let insertedUsername = ''
    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn().mockImplementation((_sql: string, params: unknown[]) => {
          insertedUsername = params[0] as string
          return Promise.resolve({
            rows: [{ id: LOCAL_ID, username: fallbackUsername(CLERK_ID), email: 'u@example.com', role: 'user', status: 'active' }],
          })
        }),
      }
      return fn(fakeClient as never)
    })

    await resolveClerkUser(CLERK_ID)
    expect(insertedUsername).toMatch(/^ck_[0-9a-f]{24}$/)
    expect(insertedUsername.length).toBe(27)
  })

  it('uses synthetic email when Clerk has no email', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ email: null }) as never)
    // No email → no email conflict check; no valid username → no username conflict check

    let insertedEmail = ''
    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn().mockImplementation((_sql: string, params: unknown[]) => {
          insertedEmail = params[1] as string
          return Promise.resolve({
            rows: [{ id: LOCAL_ID, username: fallbackUsername(CLERK_ID), email: params[1], role: 'user', status: 'active' }],
          })
        }),
      }
      return fn(fakeClient as never)
    })

    await resolveClerkUser(CLERK_ID)
    expect(insertedEmail).toMatch(/@internal\.invalid$/)
  })
})

// ------------------------------------------------------------------ collision detection

describe('resolveClerkUser — collision detection', () => {
  it('throws ACCOUNT_LINK_REQUIRED on email collision (pre-check)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ email: 'taken@example.com' }) as never)
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'other-user-id' }], rowCount: 1 }) // email conflict

    await expect(resolveClerkUser(CLERK_ID)).rejects.toMatchObject({ code: 'ACCOUNT_LINK_REQUIRED' })
    expect(mockWithTransaction).not.toHaveBeenCalled()
  })

  it('throws ACCOUNT_LINK_REQUIRED on username collision (pre-check)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ username: 'takenuser', email: 'free@example.com' }) as never)
    mockQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })               // email: no conflict
      .mockResolvedValueOnce({ rows: [{ id: 'other' }], rowCount: 1 }) // username: conflict

    await expect(resolveClerkUser(CLERK_ID)).rejects.toMatchObject({ code: 'ACCOUNT_LINK_REQUIRED' })
    expect(mockWithTransaction).not.toHaveBeenCalled()
  })

  it('never auto-links sendai or any legacy account — stops at collision, no INSERT', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ username: 'sendai', email: 'owner@example.com' }) as never)
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'sendai-uuid' }], rowCount: 1 }) // email collision

    const err = await resolveClerkUser(CLERK_ID).catch((e) => e)
    expect(err).toBeInstanceOf(ClerkResolverError)
    expect(err.code).toBe('ACCOUNT_LINK_REQUIRED')
    expect(mockWithTransaction).not.toHaveBeenCalled()
  })

  it('concurrent email conflict at INSERT time => ACCOUNT_LINK_REQUIRED', async () => {
    // Race: pre-check passed but a concurrent user claimed the email before our INSERT
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ email: 'raced@example.com' }) as never)
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email pre-check: clear (race window)

    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn().mockRejectedValueOnce({
          code: '23505',
          constraint: 'users_email_idx',
        }),
      }
      return fn(fakeClient as never)
    })

    await expect(resolveClerkUser(CLERK_ID)).rejects.toMatchObject({ code: 'ACCOUNT_LINK_REQUIRED' })
  })

  it('concurrent username conflict at INSERT time with real Clerk username => ACCOUNT_LINK_REQUIRED', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ username: 'raceduser', email: 'u@example.com' }) as never)
    mockQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email pre-check: clear
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // username pre-check: clear (race window)

    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn().mockRejectedValueOnce({
          code: '23505',
          constraint: 'users_username_idx',
        }),
      }
      return fn(fakeClient as never)
    })

    await expect(resolveClerkUser(CLERK_ID)).rejects.toMatchObject({ code: 'ACCOUNT_LINK_REQUIRED' })
  })

  it('generated fallback username uniqueness conflict => PROVISIONING_FAILED', async () => {
    // Clerk has no username → fallback generated → fallback happens to collide
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ username: null, email: 'u@example.com' }) as never)
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email pre-check: clear

    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn().mockRejectedValueOnce({
          code: '23505',
          constraint: 'users_username_idx',
        }),
      }
      return fn(fakeClient as never)
    })

    await expect(resolveClerkUser(CLERK_ID)).rejects.toMatchObject({ code: 'PROVISIONING_FAILED' })
  })
})

// ------------------------------------------------------------------ concurrency — clerk_id race

describe('resolveClerkUser — clerk_id race (ON CONFLICT DO NOTHING)', () => {
  it('re-queries and returns the winner row when INSERT returns 0 rows (DO NOTHING)', async () => {
    // Two simultaneous first-sign-ins: our INSERT loses the race.
    // DO NOTHING means no error thrown — 0 rows returned — transaction still valid.
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup: miss
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ email: 'race@example.com' }) as never)
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email: no conflict

    const winnerRow = {
      id: 'winner-uuid',
      username: 'ck_winner1',
      email: 'race@example.com',
      role: 'user',
      status: 'active',
    }

    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn()
          // First call: INSERT ON CONFLICT DO NOTHING → 0 rows (no error thrown)
          .mockResolvedValueOnce({ rows: [] })
          // Second call: re-SELECT by clerk_id → winner's row
          .mockResolvedValueOnce({ rows: [winnerRow] }),
      }
      return fn(fakeClient as never)
    })

    const result = await resolveClerkUser(CLERK_ID)
    expect(result.id).toBe('winner-uuid')
  })

  it('race implementation does NOT query after an aborted (thrown) transaction state', async () => {
    // This test verifies that the 0-rows path (DO NOTHING) — not the catch path —
    // is used for clerk_id races. The catch path is only for email/username 23505.
    // We simulate the DO NOTHING (0-row) path and confirm the second query runs without error.
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ email: 'safe@example.com' }) as never)
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email: no conflict

    const callOrder: string[] = []

    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn().mockImplementation(() => {
          if (callOrder.length === 0) {
            callOrder.push('insert-do-nothing')
            return Promise.resolve({ rows: [] }) // DO NOTHING: 0 rows, no error
          }
          callOrder.push('re-select')
          return Promise.resolve({
            rows: [{ id: 'winner-id', username: 'ck_abc', email: 'safe@example.com', role: 'user', status: 'active' }],
          })
        }),
      }
      return fn(fakeClient as never)
    })

    const result = await resolveClerkUser(CLERK_ID)
    expect(callOrder).toEqual(['insert-do-nothing', 're-select'])
    expect(result.id).toBe('winner-id')
  })

  it('suspended winner row after race => ACCOUNT_SUSPENDED', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // clerk_id lookup
    mockGetUser.mockResolvedValueOnce(makeClerkUser({ email: 'race@example.com' }) as never)
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email: no conflict

    mockWithTransaction.mockImplementationOnce(async (fn) => {
      const fakeClient = {
        query: vi.fn()
          .mockResolvedValueOnce({ rows: [] }) // DO NOTHING: 0 rows
          .mockResolvedValueOnce({ rows: [{ id: 'w', username: 'x', email: 'y', role: 'user', status: 'suspended' }] }),
      }
      return fn(fakeClient as never)
    })

    await expect(resolveClerkUser(CLERK_ID)).rejects.toMatchObject({ code: 'ACCOUNT_SUSPENDED' })
  })
})
