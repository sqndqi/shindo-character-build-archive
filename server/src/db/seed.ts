import { getPool } from './index'

interface SeedResult {
  userId: string
  action: 'created' | 'updated' | 'unchanged'
  entitlementAction: 'created' | 'already_exists'
}

export async function runOwnerSeed(): Promise<SeedResult> {
  const ownerUsername = process.env.OWNER_USERNAME
  const ownerPasswordHash = process.env.OWNER_PASSWORD_HASH

  if (!ownerUsername?.trim()) throw new Error('OWNER_USERNAME env var is required for owner seed.')
  if (!ownerPasswordHash?.trim()) throw new Error('OWNER_PASSWORD_HASH env var is required for owner seed.')

  // Validate hash format without logging the value
  const isValidHash = /^\$2[aby]\$/.test(ownerPasswordHash)
  if (!isValidHash) throw new Error('OWNER_PASSWORD_HASH does not appear to be a valid bcrypt hash.')

  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const normalized = ownerUsername.trim().toLowerCase()

    // Upsert owner user
    const existing = await client.query<{ id: string; password_hash: string }>(
      `SELECT id, password_hash FROM users WHERE LOWER(username) = $1`,
      [normalized],
    )

    let userId: string
    let action: SeedResult['action']

    if (existing.rows.length === 0) {
      const result = await client.query<{ id: string }>(
        `INSERT INTO users (username, email, password_hash, role, status)
         VALUES ($1, $2, $3, 'owner', 'active')
         RETURNING id`,
        [normalized, `${normalized}@archive.internal`, ownerPasswordHash],
      )
      userId = result.rows[0].id
      action = 'created'
    } else {
      userId = existing.rows[0].id
      const currentHash = existing.rows[0].password_hash
      const hashChanged = currentHash !== ownerPasswordHash

      await client.query(
        `UPDATE users
         SET role = 'owner',
             status = 'active',
             password_hash = $2,
             updated_at = NOW()
         WHERE id = $1`,
        [userId, ownerPasswordHash],
      )
      action = hashChanged ? 'updated' : 'unchanged'
    }

    // Ensure permanent full-archive entitlement (idempotent — never duplicate)
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
         VALUES ($1, 'full_archive', '{"fullArchive": true}', 'active', 'owner', 'owner-seed')`,
        [userId],
      )
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, metadata)
         VALUES ($1, 'owner_seed_entitlement_created', 'user', $2, '{"source":"owner-seed"}')`,
        [userId, userId],
      )
      entitlementAction = 'created'
    } else {
      entitlementAction = 'already_exists'
    }

    await client.query('COMMIT')
    return { userId, action, entitlementAction }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// Run when executed directly: tsx src/db/seed.ts
if (process.argv[1]?.includes('seed')) {
  runOwnerSeed()
    .then((result) => {
      console.log(`[seed] Owner ${result.action}. Entitlement ${result.entitlementAction}.`)
      process.exit(0)
    })
    .catch((err: unknown) => {
      console.error('[seed] Failed:', err instanceof Error ? err.message : String(err))
      process.exit(1)
    })
}
