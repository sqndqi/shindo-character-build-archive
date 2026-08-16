import type { PoolClient } from 'pg'
import { getPool } from './index'

export interface SeedResult {
  userId: string
  action: 'created' | 'updated' | 'unchanged'
  entitlementAction: 'created' | 'already_exists'
}

export interface OwnerSeedInput {
  /** Raw configured username. Normalized (trim + lowercase) before any lookup or write. */
  username: string
  /** bcrypt hash. Never logged, never included in error messages. */
  passwordHash: string
  /** Stable, non-secret marker written to entitlements + audit metadata. */
  sourceReference: string
}

export interface OwnerSeedConfig extends OwnerSeedInput {
  /** Human-readable slot name used only in configuration error messages. */
  label: string
  /** Env var names for this slot, used only to build actionable error messages. */
  usernameVar: string
  passwordHashVar: string
}

export interface OwnerSeedOutcome extends SeedResult {
  sourceReference: string
}

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$/

function isPresent(value: string | undefined): boolean {
  return Boolean(value?.trim())
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

/**
 * Deterministic internal email for an owner account.
 * Derived from the normalized username so it is stable across reseeds and
 * unique per owner (users_email_idx is UNIQUE on LOWER(email)).
 */
function ownerEmail(normalizedUsername: string): string {
  return `${normalizedUsername}@archive.internal`
}

/**
 * Resolves configured owner slots from the environment.
 *
 * Primary slot (OWNER_USERNAME / OWNER_PASSWORD_HASH) is always required — this
 * preserves the pre-existing production contract.
 *
 * Secondary slot (OWNER_2_USERNAME / OWNER_2_PASSWORD_HASH) is opt-in: both
 * absent means "second owner not enabled" and is not an error. Exactly one of
 * the pair present is always a configuration error — a partially configured
 * owner is never created silently.
 *
 * Throws before any DB write. Error messages name env vars only, never values.
 */
export function readOwnerSeedConfigs(env: NodeJS.ProcessEnv = process.env): OwnerSeedConfig[] {
  const configs: OwnerSeedConfig[] = []

  const primaryUsername = env.OWNER_USERNAME
  const primaryHash = env.OWNER_PASSWORD_HASH

  if (!isPresent(primaryUsername)) {
    throw new Error('OWNER_USERNAME env var is required for owner seed.')
  }
  if (!isPresent(primaryHash)) {
    throw new Error('OWNER_PASSWORD_HASH env var is required for owner seed.')
  }

  configs.push({
    username: primaryUsername as string,
    passwordHash: primaryHash as string,
    sourceReference: 'owner-seed-primary',
    label: 'primary owner',
    usernameVar: 'OWNER_USERNAME',
    passwordHashVar: 'OWNER_PASSWORD_HASH',
  })

  const secondUsername = env.OWNER_2_USERNAME
  const secondHash = env.OWNER_2_PASSWORD_HASH
  const hasSecondUsername = isPresent(secondUsername)
  const hasSecondHash = isPresent(secondHash)

  if (hasSecondUsername !== hasSecondHash) {
    const provided = hasSecondUsername ? 'OWNER_2_USERNAME' : 'OWNER_2_PASSWORD_HASH'
    const missing = hasSecondUsername ? 'OWNER_2_PASSWORD_HASH' : 'OWNER_2_USERNAME'
    throw new Error(
      `Incomplete second owner configuration: ${provided} is set but ${missing} is missing. ` +
        `Set both to enable the second owner, or neither to leave it disabled.`,
    )
  }

  if (hasSecondUsername && hasSecondHash) {
    configs.push({
      username: secondUsername as string,
      passwordHash: secondHash as string,
      sourceReference: 'owner-seed-secondary',
      label: 'second owner',
      usernameVar: 'OWNER_2_USERNAME',
      passwordHashVar: 'OWNER_2_PASSWORD_HASH',
    })
  }

  validateOwnerSeedConfigs(configs)
  return configs
}

/**
 * Validates every configured owner before any DB write occurs.
 * Rejects invalid bcrypt hashes and case-insensitive username collisions.
 */
export function validateOwnerSeedConfigs(configs: OwnerSeedConfig[]): void {
  for (const config of configs) {
    if (!BCRYPT_HASH_PATTERN.test(config.passwordHash)) {
      throw new Error(`${config.passwordHashVar} does not appear to be a valid bcrypt hash.`)
    }
  }

  const seen = new Map<string, OwnerSeedConfig>()
  for (const config of configs) {
    const normalized = normalizeUsername(config.username)
    const collision = seen.get(normalized)
    if (collision) {
      throw new Error(
        `${collision.usernameVar} and ${config.usernameVar} resolve to the same username. ` +
          `Each owner must have a distinct username.`,
      )
    }
    seen.set(normalized, config)
  }
}

/**
 * Seeds a single owner inside a caller-supplied transaction.
 *
 * Creates the local user when absent. When the username already exists — including
 * as an ordinary user — the existing users.id is preserved and the row is promoted
 * in place to role='owner', status='active', with the configured password hash
 * synchronized. Foreign keys referencing that user are therefore never disturbed.
 *
 * The full_archive entitlement is looked up by (user_id, type, source, status) and
 * created only when absent, so repeat runs never duplicate it.
 */
export async function seedOwner(client: PoolClient, input: OwnerSeedInput): Promise<OwnerSeedOutcome> {
  const normalized = normalizeUsername(input.username)

  const existing = await client.query<{ id: string; password_hash: string; role: string }>(
    `SELECT id, password_hash, role FROM users WHERE LOWER(username) = $1`,
    [normalized],
  )

  let userId: string
  let action: SeedResult['action']

  if (existing.rows.length === 0) {
    const result = await client.query<{ id: string }>(
      `INSERT INTO users (username, email, password_hash, role, status)
       VALUES ($1, $2, $3, 'owner', 'active')
       RETURNING id`,
      [normalized, ownerEmail(normalized), input.passwordHash],
    )
    userId = result.rows[0].id
    action = 'created'

    await client.query(
      `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, metadata)
       VALUES ($1, 'owner_seed_user_created', 'user', $2, $3)`,
      [userId, userId, JSON.stringify({ sourceReference: input.sourceReference })],
    )
  } else {
    userId = existing.rows[0].id
    const previousRole = existing.rows[0].role
    const hashChanged = existing.rows[0].password_hash !== input.passwordHash

    await client.query(
      `UPDATE users
       SET role = 'owner',
           status = 'active',
           password_hash = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [userId, input.passwordHash],
    )
    action = hashChanged ? 'updated' : 'unchanged'

    // A pre-existing non-owner account being raised to owner is a privilege change
    // and is always recorded, even when the password hash was already in sync.
    if (previousRole !== 'owner') {
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, metadata)
         VALUES ($1, 'owner_seed_user_promoted', 'user', $2, $3)`,
        [
          userId,
          userId,
          JSON.stringify({ sourceReference: input.sourceReference, previousRole }),
        ],
      )
    }
  }

  // Ensure permanent full-archive entitlement (idempotent — never duplicate).
  // Matched on user_id/type/source/status so entitlements written by earlier
  // seed versions under a different source_reference are still recognized.
  const entExisting = await client.query(
    `SELECT id FROM entitlements
     WHERE user_id = $1
       AND entitlement_type = 'full_archive'
       AND source = 'owner'
       AND status = 'active'`,
    [userId],
  )

  let entitlementAction: SeedResult['entitlementAction']

  if (entExisting.rows.length === 0) {
    await client.query(
      `INSERT INTO entitlements
         (user_id, entitlement_type, resource_mapping, status, source, source_reference)
       VALUES ($1, 'full_archive', '{"fullArchive": true}', 'active', 'owner', $2)`,
      [userId, input.sourceReference],
    )
    await client.query(
      `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, metadata)
       VALUES ($1, 'owner_seed_entitlement_created', 'user', $2, $3)`,
      [userId, userId, JSON.stringify({ sourceReference: input.sourceReference })],
    )
    entitlementAction = 'created'
  } else {
    entitlementAction = 'already_exists'
  }

  return { userId, action, entitlementAction, sourceReference: input.sourceReference }
}

/**
 * Seeds every configured owner in a single transaction.
 * Configuration is fully validated before the transaction opens, so a
 * misconfigured second owner never leaves partial state behind.
 */
export async function seedConfiguredOwners(
  env: NodeJS.ProcessEnv = process.env,
): Promise<OwnerSeedOutcome[]> {
  const configs = readOwnerSeedConfigs(env)

  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const outcomes: OwnerSeedOutcome[] = []
    for (const config of configs) {
      outcomes.push(
        await seedOwner(client, {
          username: config.username,
          passwordHash: config.passwordHash,
          sourceReference: config.sourceReference,
        }),
      )
    }

    await client.query('COMMIT')
    return outcomes
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/** Alias kept for callers that prefer the plural name. */
export const runOwnerSeeds = seedConfiguredOwners

/**
 * Backwards-compatible primary-owner seed.
 *
 * Retains the original signature and return shape. Seeds only the primary owner
 * and ignores any second-owner configuration, so existing importers and tests
 * observe unchanged behavior.
 */
export async function runOwnerSeed(): Promise<SeedResult> {
  const [primary] = readOwnerSeedConfigs(process.env)

  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const outcome = await seedOwner(client, {
      username: primary.username,
      passwordHash: primary.passwordHash,
      sourceReference: primary.sourceReference,
    })
    await client.query('COMMIT')
    return {
      userId: outcome.userId,
      action: outcome.action,
      entitlementAction: outcome.entitlementAction,
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// Run when executed directly: tsx src/db/seed.ts
if (process.argv[1]?.includes('seed')) {
  seedConfiguredOwners()
    .then((outcomes) => {
      for (const outcome of outcomes) {
        console.log(
          `[seed] Owner (${outcome.sourceReference}) ${outcome.action}. ` +
            `Entitlement ${outcome.entitlementAction}.`,
        )
      }
      process.exit(0)
    })
    .catch((err: unknown) => {
      console.error('[seed] Failed:', err instanceof Error ? err.message : String(err))
      process.exit(1)
    })
}
