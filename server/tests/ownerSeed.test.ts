import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the pool before importing the module under test.
vi.mock('../src/db/index', () => ({
  getPool: vi.fn(),
}))

import { getPool } from '../src/db/index'
import {
  readOwnerSeedConfigs,
  validateOwnerSeedConfigs,
  seedConfiguredOwners,
  runOwnerSeed,
  runOwnerSeeds,
  type OwnerSeedConfig,
} from '../src/db/seed'
import { requireOwner } from '../src/middleware/auth'

// Synthetic bcrypt-shaped hashes. Not real credentials.
const PRIMARY_HASH = '$2b$04$primaryownersynthetichashvalue000000000000000000000'
const SECOND_HASH = '$2b$04$secondownersynthetichashvalue0000000000000000000000'
const OTHER_HASH = '$2b$04$rotatedownersynthetichashvalue000000000000000000000'

const PRIMARY_USERNAME = 'primary_owner'
const SECOND_USERNAME = 'second_owner'

const PRIMARY_ID = '11111111-1111-1111-1111-111111111111'
const SECOND_ID = '22222222-2222-2222-2222-222222222222'

interface UserRow {
  id: string
  username: string
  email: string
  password_hash: string
  role: string
  status: string
}

interface EntitlementRow {
  id: string
  user_id: string
  entitlement_type: string
  source: string
  status: string
  source_reference: string | null
}

interface AuditRow {
  actor_user_id: string
  action: string
  target_type: string | null
  target_id: string | null
  metadata: string
}

/**
 * Minimal in-memory stand-in for the subset of Postgres the seed touches.
 * Enforces the uniqueness rule that matters here — one user per lower(username) —
 * and reproduces the seed's own entitlement lookup semantics.
 */
class FakeDb {
  users: UserRow[] = []
  entitlements: EntitlementRow[] = []
  auditLogs: AuditRow[] = []
  statements: string[] = []
  released = 0
  private nextUserIds: string[]
  private seq = 0

  constructor(nextUserIds: string[] = [PRIMARY_ID, SECOND_ID]) {
    this.nextUserIds = [...nextUserIds]
  }

  seedExistingUser(row: Partial<UserRow> & { id: string; username: string }): void {
    this.users.push({
      email: `${row.username}@example.com`,
      password_hash: OTHER_HASH,
      role: 'user',
      status: 'active',
      ...row,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
    const sql = text.trim()
    this.statements.push(sql.split('\n')[0].trim())

    if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(sql)) return { rows: [] }

    if (sql.startsWith('SELECT id, password_hash, role FROM users')) {
      const normalized = params[0] as string
      const found = this.users.find((u) => u.username.toLowerCase() === normalized)
      return { rows: found ? [found] : [] }
    }

    if (sql.startsWith('INSERT INTO users')) {
      const [username, email, passwordHash] = params as string[]
      if (this.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('duplicate key value violates unique constraint "users_username_idx"')
      }
      const id = this.nextUserIds[this.seq++] ?? `generated-${this.seq}`
      this.users.push({
        id,
        username,
        email,
        password_hash: passwordHash,
        role: 'owner',
        status: 'active',
      })
      return { rows: [{ id }] }
    }

    if (sql.startsWith('UPDATE users')) {
      const [id, passwordHash] = params as string[]
      const user = this.users.find((u) => u.id === id)
      if (user) {
        user.role = 'owner'
        user.status = 'active'
        user.password_hash = passwordHash
      }
      return { rows: [] }
    }

    if (sql.startsWith('SELECT id FROM entitlements')) {
      const userId = params[0] as string
      const found = this.entitlements.filter(
        (e) =>
          e.user_id === userId &&
          e.entitlement_type === 'full_archive' &&
          e.source === 'owner' &&
          e.status === 'active',
      )
      return { rows: found.map((e) => ({ id: e.id })) }
    }

    if (sql.startsWith('INSERT INTO entitlements')) {
      const [userId, sourceReference] = params as string[]
      this.entitlements.push({
        id: `ent-${this.entitlements.length + 1}`,
        user_id: userId,
        entitlement_type: 'full_archive',
        source: 'owner',
        status: 'active',
        source_reference: sourceReference ?? null,
      })
      return { rows: [] }
    }

    if (sql.startsWith('INSERT INTO audit_logs')) {
      const [actorUserId, targetId, metadata] = params as string[]
      const action = /VALUES \(\$1, '([a-z_]+)'/.exec(sql)?.[1] ?? 'unknown'
      this.auditLogs.push({
        actor_user_id: actorUserId,
        action,
        target_type: 'user',
        target_id: targetId,
        metadata: metadata ?? '{}',
      })
      return { rows: [] }
    }

    throw new Error(`FakeDb received an unexpected statement: ${sql}`)
  }

  release(): void {
    this.released += 1
  }

  install(): void {
    vi.mocked(getPool).mockReturnValue({
      connect: async () => ({
        query: this.query.bind(this),
        release: this.release.bind(this),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  ownerEntitlementsFor(userId: string): EntitlementRow[] {
    return this.entitlements.filter((e) => e.user_id === userId)
  }
}

function envWith(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  const merged: NodeJS.ProcessEnv = {
    OWNER_USERNAME: PRIMARY_USERNAME,
    OWNER_PASSWORD_HASH: PRIMARY_HASH,
    ...overrides,
  }
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined) delete merged[key]
  }
  return merged
}

function bothOwnersEnv(): NodeJS.ProcessEnv {
  return envWith({
    OWNER_2_USERNAME: SECOND_USERNAME,
    OWNER_2_PASSWORD_HASH: SECOND_HASH,
  })
}

let db: FakeDb

beforeEach(() => {
  vi.resetAllMocks()
  db = new FakeDb()
  db.install()
})

// ------------------------------------------------------- configuration parsing

describe('readOwnerSeedConfigs', () => {
  it('returns only the primary owner when no second owner is configured', () => {
    const configs = readOwnerSeedConfigs(envWith())
    expect(configs).toHaveLength(1)
    expect(configs[0].username).toBe(PRIMARY_USERNAME)
    expect(configs[0].sourceReference).toBe('owner-seed-primary')
  })

  it('returns both owners with distinct source references when both are configured', () => {
    const configs = readOwnerSeedConfigs(bothOwnersEnv())
    expect(configs).toHaveLength(2)
    expect(configs.map((c) => c.sourceReference)).toEqual([
      'owner-seed-primary',
      'owner-seed-secondary',
    ])
  })

  it('fails clearly when only OWNER_2_USERNAME is configured', () => {
    expect(() => readOwnerSeedConfigs(envWith({ OWNER_2_USERNAME: SECOND_USERNAME }))).toThrow(
      /OWNER_2_USERNAME is set but OWNER_2_PASSWORD_HASH is missing/,
    )
  })

  it('fails clearly when only OWNER_2_PASSWORD_HASH is configured', () => {
    expect(() => readOwnerSeedConfigs(envWith({ OWNER_2_PASSWORD_HASH: SECOND_HASH }))).toThrow(
      /OWNER_2_PASSWORD_HASH is set but OWNER_2_USERNAME is missing/,
    )
  })

  it('rejects a second owner whose username collides case-insensitively', () => {
    const env = envWith({
      OWNER_2_USERNAME: PRIMARY_USERNAME.toUpperCase(),
      OWNER_2_PASSWORD_HASH: SECOND_HASH,
    })
    expect(() => readOwnerSeedConfigs(env)).toThrow(/resolve to the same username/)
  })

  it('rejects an invalid second-owner bcrypt hash', () => {
    const env = envWith({
      OWNER_2_USERNAME: SECOND_USERNAME,
      OWNER_2_PASSWORD_HASH: 'not-a-bcrypt-hash',
    })
    expect(() => readOwnerSeedConfigs(env)).toThrow(
      /OWNER_2_PASSWORD_HASH does not appear to be a valid bcrypt hash/,
    )
  })

  it('still requires the primary owner variables', () => {
    expect(() => readOwnerSeedConfigs(envWith({ OWNER_USERNAME: undefined }))).toThrow(
      /OWNER_USERNAME env var is required/,
    )
    expect(() => readOwnerSeedConfigs(envWith({ OWNER_PASSWORD_HASH: undefined }))).toThrow(
      /OWNER_PASSWORD_HASH env var is required/,
    )
  })

  it('never includes a password hash in configuration error messages', () => {
    const cases: NodeJS.ProcessEnv[] = [
      envWith({ OWNER_2_USERNAME: SECOND_USERNAME }),
      envWith({ OWNER_2_PASSWORD_HASH: SECOND_HASH }),
      envWith({ OWNER_2_USERNAME: SECOND_USERNAME, OWNER_2_PASSWORD_HASH: 'bad' }),
      envWith({ OWNER_2_USERNAME: PRIMARY_USERNAME, OWNER_2_PASSWORD_HASH: SECOND_HASH }),
    ]

    for (const env of cases) {
      let message = ''
      try {
        readOwnerSeedConfigs(env)
      } catch (err) {
        message = err instanceof Error ? err.message : String(err)
      }
      expect(message).not.toBe('')
      expect(message).not.toContain(PRIMARY_HASH)
      expect(message).not.toContain(SECOND_HASH)
      expect(message).not.toContain('$2b$')
    }
  })
})

describe('validateOwnerSeedConfigs', () => {
  it('rejects duplicate usernames before any write', () => {
    const configs: OwnerSeedConfig[] = [
      {
        username: 'shared_name',
        passwordHash: PRIMARY_HASH,
        sourceReference: 'owner-seed-primary',
        label: 'primary owner',
        usernameVar: 'OWNER_USERNAME',
        passwordHashVar: 'OWNER_PASSWORD_HASH',
      },
      {
        username: 'SHARED_NAME',
        passwordHash: SECOND_HASH,
        sourceReference: 'owner-seed-secondary',
        label: 'second owner',
        usernameVar: 'OWNER_2_USERNAME',
        passwordHashVar: 'OWNER_2_PASSWORD_HASH',
      },
    ]
    expect(() => validateOwnerSeedConfigs(configs)).toThrow(/resolve to the same username/)
  })
})

// ------------------------------------------------------------ seeding behavior

describe('seedConfiguredOwners — primary owner only', () => {
  it('creates the primary owner with role owner, status active, and full archive', async () => {
    const outcomes = await seedConfiguredOwners(envWith())

    expect(outcomes).toHaveLength(1)
    expect(outcomes[0].action).toBe('created')
    expect(outcomes[0].entitlementAction).toBe('created')

    expect(db.users).toHaveLength(1)
    expect(db.users[0]).toMatchObject({
      username: PRIMARY_USERNAME,
      email: `${PRIMARY_USERNAME}@archive.internal`,
      password_hash: PRIMARY_HASH,
      role: 'owner',
      status: 'active',
    })

    const ents = db.ownerEntitlementsFor(PRIMARY_ID)
    expect(ents).toHaveLength(1)
    expect(ents[0]).toMatchObject({
      entitlement_type: 'full_archive',
      source: 'owner',
      status: 'active',
      source_reference: 'owner-seed-primary',
    })
  })

  it('leaves the existing owner untouched when second owner config is absent', async () => {
    await seedConfiguredOwners(envWith())
    const before = JSON.stringify({ users: db.users, entitlements: db.entitlements })

    await seedConfiguredOwners(envWith())
    const after = JSON.stringify({ users: db.users, entitlements: db.entitlements })

    expect(after).toBe(before)
    expect(db.users).toHaveLength(1)
  })
})

describe('seedConfiguredOwners — two owners', () => {
  it('seeds both owners with different users.id values', async () => {
    const outcomes = await seedConfiguredOwners(bothOwnersEnv())

    expect(outcomes).toHaveLength(2)
    expect(outcomes[0].userId).toBe(PRIMARY_ID)
    expect(outcomes[1].userId).toBe(SECOND_ID)
    expect(outcomes[0].userId).not.toBe(outcomes[1].userId)
  })

  it('gives both owners role=owner and status=active', async () => {
    await seedConfiguredOwners(bothOwnersEnv())

    expect(db.users).toHaveLength(2)
    for (const user of db.users) {
      expect(user.role).toBe('owner')
      expect(user.status).toBe('active')
    }
  })

  it('gives each owner its own full_archive entitlement row', async () => {
    await seedConfiguredOwners(bothOwnersEnv())

    const primaryEnts = db.ownerEntitlementsFor(PRIMARY_ID)
    const secondEnts = db.ownerEntitlementsFor(SECOND_ID)

    expect(primaryEnts).toHaveLength(1)
    expect(secondEnts).toHaveLength(1)
    expect(primaryEnts[0].id).not.toBe(secondEnts[0].id)
    expect(primaryEnts[0].source_reference).toBe('owner-seed-primary')
    expect(secondEnts[0].source_reference).toBe('owner-seed-secondary')

    for (const ent of [...primaryEnts, ...secondEnts]) {
      expect(ent.entitlement_type).toBe('full_archive')
      expect(ent.source).toBe('owner')
      expect(ent.status).toBe('active')
    }
  })

  it('assigns each owner a distinct deterministic internal email', async () => {
    await seedConfiguredOwners(bothOwnersEnv())
    const emails = db.users.map((u) => u.email)
    expect(new Set(emails).size).toBe(2)
    expect(emails).toContain(`${PRIMARY_USERNAME}@archive.internal`)
    expect(emails).toContain(`${SECOND_USERNAME}@archive.internal`)
  })

  it('is idempotent — repeated runs create no duplicate users or entitlements', async () => {
    await seedConfiguredOwners(bothOwnersEnv())
    await seedConfiguredOwners(bothOwnersEnv())
    const third = await seedConfiguredOwners(bothOwnersEnv())

    expect(db.users).toHaveLength(2)
    expect(db.entitlements).toHaveLength(2)
    expect(db.ownerEntitlementsFor(PRIMARY_ID)).toHaveLength(1)
    expect(db.ownerEntitlementsFor(SECOND_ID)).toHaveLength(1)

    for (const outcome of third) {
      expect(outcome.action).toBe('unchanged')
      expect(outcome.entitlementAction).toBe('already_exists')
    }
  })

  it('records the transaction boundary once per run', async () => {
    await seedConfiguredOwners(bothOwnersEnv())
    expect(db.statements.filter((s) => s === 'BEGIN')).toHaveLength(1)
    expect(db.statements.filter((s) => s === 'COMMIT')).toHaveLength(1)
    expect(db.statements.filter((s) => s === 'ROLLBACK')).toHaveLength(0)
    expect(db.released).toBe(1)
  })
})

describe('seedConfiguredOwners — promoting an existing account', () => {
  it('promotes an existing regular user in place, preserving users.id', async () => {
    const existingId = '99999999-9999-9999-9999-999999999999'
    db.seedExistingUser({ id: existingId, username: SECOND_USERNAME, role: 'user' })

    const outcomes = await seedConfiguredOwners(bothOwnersEnv())

    expect(db.users).toHaveLength(2)
    const promoted = db.users.find((u) => u.id === existingId)
    expect(promoted).toBeDefined()
    expect(promoted?.role).toBe('owner')
    expect(promoted?.status).toBe('active')
    expect(promoted?.password_hash).toBe(SECOND_HASH)

    expect(outcomes[1].userId).toBe(existingId)
    expect(outcomes[1].action).toBe('updated')
    expect(db.ownerEntitlementsFor(existingId)).toHaveLength(1)
  })

  it('reactivates a suspended account rather than creating a duplicate', async () => {
    const existingId = '88888888-8888-8888-8888-888888888888'
    db.seedExistingUser({
      id: existingId,
      username: SECOND_USERNAME,
      role: 'user',
      status: 'suspended',
    })

    await seedConfiguredOwners(bothOwnersEnv())

    expect(db.users.filter((u) => u.username.toLowerCase() === SECOND_USERNAME)).toHaveLength(1)
    expect(db.users.find((u) => u.id === existingId)?.status).toBe('active')
  })

  it('audits the promotion of a pre-existing non-owner account', async () => {
    const existingId = '77777777-7777-7777-7777-777777777777'
    db.seedExistingUser({ id: existingId, username: SECOND_USERNAME, role: 'user' })

    await seedConfiguredOwners(bothOwnersEnv())

    const promotion = db.auditLogs.find(
      (a) => a.action === 'owner_seed_user_promoted' && a.target_id === existingId,
    )
    expect(promotion).toBeDefined()
    expect(promotion?.metadata).toContain('owner-seed-secondary')
    expect(promotion?.metadata).toContain('"previousRole":"user"')
  })
})

// ---------------------------------------------------------------- audit safety

describe('owner seed audit logging', () => {
  it('distinguishes user creation from entitlement creation per owner', async () => {
    await seedConfiguredOwners(bothOwnersEnv())

    const created = db.auditLogs.filter((a) => a.action === 'owner_seed_user_created')
    const entitlements = db.auditLogs.filter((a) => a.action === 'owner_seed_entitlement_created')

    expect(created).toHaveLength(2)
    expect(entitlements).toHaveLength(2)
    expect(created.map((a) => a.target_id).sort()).toEqual([PRIMARY_ID, SECOND_ID].sort())
    expect(entitlements.map((a) => a.target_id).sort()).toEqual([PRIMARY_ID, SECOND_ID].sort())
  })

  it('tags each owner audit entry with its own safe source reference', async () => {
    await seedConfiguredOwners(bothOwnersEnv())

    const primaryEntries = db.auditLogs.filter((a) => a.target_id === PRIMARY_ID)
    const secondEntries = db.auditLogs.filter((a) => a.target_id === SECOND_ID)

    expect(primaryEntries.length).toBeGreaterThan(0)
    expect(secondEntries.length).toBeGreaterThan(0)
    for (const entry of primaryEntries) {
      expect(entry.metadata).toContain('owner-seed-primary')
    }
    for (const entry of secondEntries) {
      expect(entry.metadata).toContain('owner-seed-secondary')
    }
  })

  it('never writes a password hash into audit metadata', async () => {
    await seedConfiguredOwners(bothOwnersEnv())

    for (const entry of db.auditLogs) {
      expect(entry.metadata).not.toContain(PRIMARY_HASH)
      expect(entry.metadata).not.toContain(SECOND_HASH)
      expect(entry.metadata).not.toContain('$2b$')
    }
  })
})

// ------------------------------------------------------ backwards compatibility

describe('runOwnerSeed — legacy primary-owner entrypoint', () => {
  it('keeps its original single-result shape', async () => {
    process.env.OWNER_USERNAME = PRIMARY_USERNAME
    process.env.OWNER_PASSWORD_HASH = PRIMARY_HASH
    delete process.env.OWNER_2_USERNAME
    delete process.env.OWNER_2_PASSWORD_HASH

    const result = await runOwnerSeed()

    expect(result).toEqual({
      userId: PRIMARY_ID,
      action: 'created',
      entitlementAction: 'created',
    })
    expect(db.users).toHaveLength(1)
  })

  it('seeds only the primary owner even when a second owner is configured', async () => {
    process.env.OWNER_USERNAME = PRIMARY_USERNAME
    process.env.OWNER_PASSWORD_HASH = PRIMARY_HASH
    process.env.OWNER_2_USERNAME = SECOND_USERNAME
    process.env.OWNER_2_PASSWORD_HASH = SECOND_HASH

    try {
      const result = await runOwnerSeed()
      expect(result.userId).toBe(PRIMARY_ID)
      expect(db.users).toHaveLength(1)
      expect(db.users[0].username).toBe(PRIMARY_USERNAME)
    } finally {
      delete process.env.OWNER_2_USERNAME
      delete process.env.OWNER_2_PASSWORD_HASH
    }
  })

  it('is exposed alongside the plural alias', () => {
    expect(typeof runOwnerSeed).toBe('function')
    expect(runOwnerSeeds).toBe(seedConfiguredOwners)
  })
})

// -------------------------------------------------- role-based authorization

describe('requireOwner accepts any account whose role is owner', () => {
  function runMiddleware(session: { userId?: string; role?: string }) {
    const req = { session } as unknown as Parameters<typeof requireOwner>[0]
    let statusCode: number | null = null
    const res = {
      status(code: number) {
        statusCode = code
        return this
      },
      json() {
        return this
      },
    } as unknown as Parameters<typeof requireOwner>[1]
    let nextCalled = false
    requireOwner(req, res, () => {
      nextCalled = true
    })
    return { nextCalled, statusCode }
  }

  it('admits the primary owner user id', () => {
    expect(runMiddleware({ userId: PRIMARY_ID, role: 'owner' }).nextCalled).toBe(true)
  })

  it('admits the second owner user id', () => {
    expect(runMiddleware({ userId: SECOND_ID, role: 'owner' }).nextCalled).toBe(true)
  })

  it('admits an owner regardless of which user id it carries', () => {
    expect(runMiddleware({ userId: 'any-other-uuid', role: 'owner' }).nextCalled).toBe(true)
  })

  it('rejects a non-owner role even with a valid session', () => {
    const result = runMiddleware({ userId: SECOND_ID, role: 'user' })
    expect(result.nextCalled).toBe(false)
    expect(result.statusCode).toBe(403)
  })
})

describe('no username-specific authorization exists', () => {
  it('requireOwner decides on role alone and never reads a username', () => {
    const source = requireOwner.toString()
    expect(source).toContain('role')
    expect(source).not.toContain('username')
  })
})
