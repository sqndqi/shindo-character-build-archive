import { Pool, type PoolClient } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured.')
    }
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
    pool.on('error', (err) => {
      console.error('[db] Unexpected pool error', err)
    })
  }
  return pool
}

export async function query<T extends object = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  const result = await getPool().query(text, params)
  return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 }
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function auditLog(
  client: PoolClient | null,
  actorUserId: string | null,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const sql = `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, metadata)
               VALUES ($1, $2, $3, $4, $5)`
  const params = [actorUserId, action, targetType ?? null, targetId ?? null, JSON.stringify(metadata ?? {})]
  if (client) {
    await client.query(sql, params)
  } else {
    await query(sql, params)
  }
}
