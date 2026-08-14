import { createHash } from 'crypto'
import { clerkClient } from '@clerk/express'
import { query, withTransaction } from '../db/index'
import type { UserRole } from '../types'

// ------------------------------------------------------------------ types

export type ResolvedLocalUser = {
  id: string
  username: string
  email: string
  role: UserRole
  status: string
}

export class ClerkResolverError extends Error {
  constructor(
    public readonly code: 'ACCOUNT_LINK_REQUIRED' | 'ACCOUNT_SUSPENDED' | 'PROVISIONING_FAILED',
    message: string,
  ) {
    super(message)
    this.name = 'ClerkResolverError'
  }
}

// ------------------------------------------------------------------ username/email helpers

const USERNAME_RE = /^[a-zA-Z0-9_-]+$/

function isValidUsername(s: string): boolean {
  return s.length >= 3 && s.length <= 30 && USERNAME_RE.test(s)
}

/**
 * Deterministic fallback username derived from the full Clerk user ID.
 * Uses first 24 hex chars of SHA-256(clerkUserId) → "ck_<24hex>" = 27 chars.
 * Passes username validation (alphanum/_/-), well within 30-char limit.
 * Collision handled by DB uniqueness constraint as a final safeguard.
 */
export function fallbackUsername(clerkUserId: string): string {
  const hash = createHash('sha256').update(clerkUserId).digest('hex').slice(0, 24)
  return `ck_${hash}`
}

/**
 * Deterministic synthetic internal email for Clerk-only accounts with no
 * usable real email. Not a real address; never shown as verified.
 */
export function syntheticEmail(clerkUserId: string): string {
  const hash = createHash('sha256').update(clerkUserId).digest('hex').slice(0, 16)
  return `clerk_${hash}@internal.invalid`
}

// ------------------------------------------------------------------ core

type DbLocalUser = {
  id: string
  username: string
  email: string
  role: UserRole
  status: string
}

type PgError = { code?: string; constraint?: string }

/**
 * Resolve a Clerk user ID to a local users row, provisioning one on first sign-in.
 *
 * Throws ClerkResolverError for:
 *   ACCOUNT_LINK_REQUIRED — email or username matches an existing legacy account
 *   ACCOUNT_SUSPENDED     — the mapped local account is suspended
 *   PROVISIONING_FAILED   — fallback username uniqueness collision (extremely rare)
 */
export async function resolveClerkUser(clerkUserId: string): Promise<ResolvedLocalUser> {
  // Step 1 — fast path: clerk_id already mapped; Clerk API not called
  const existing = await query<DbLocalUser>(
    `SELECT id, username, email, role, status
     FROM users
     WHERE clerk_id = $1
     LIMIT 1`,
    [clerkUserId],
  )
  if (existing.rows.length > 0) {
    const row = existing.rows[0]
    if (row.status === 'suspended') {
      throw new ClerkResolverError('ACCOUNT_SUSPENDED', 'Account is suspended.')
    }
    return row
  }

  // Step 2 — fetch Clerk user (only on first sign-in)
  const clerkUser = await clerkClient.users.getUser(clerkUserId)

  const clerkUsername: string | null = clerkUser.username ?? null
  const clerkEmail: string | null =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? null

  // Step 3 — pre-INSERT collision checks (optimistic; race window handled inside transaction)
  if (clerkEmail) {
    const emailConflict = await query<{ id: string }>(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [clerkEmail],
    )
    if (emailConflict.rows.length > 0) {
      throw new ClerkResolverError(
        'ACCOUNT_LINK_REQUIRED',
        'An account with this email already exists. Log in with your password to link it.',
      )
    }
  }

  if (clerkUsername && isValidUsername(clerkUsername)) {
    const usernameConflict = await query<{ id: string }>(
      `SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1`,
      [clerkUsername],
    )
    if (usernameConflict.rows.length > 0) {
      throw new ClerkResolverError(
        'ACCOUNT_LINK_REQUIRED',
        'An account with this username already exists. Log in with your password to link it.',
      )
    }
  }

  // Step 4+5+6 — determine final username and email
  const usingClerkUsername = !!(clerkUsername && isValidUsername(clerkUsername))
  const chosenUsername = usingClerkUsername ? clerkUsername! : fallbackUsername(clerkUserId)
  const chosenEmail = clerkEmail ?? syntheticEmail(clerkUserId)

  // Step 7 — get-or-create inside a transaction using ON CONFLICT (clerk_id) DO NOTHING.
  //
  // ON CONFLICT (clerk_id) DO NOTHING means:
  //   - If clerk_id is already taken (concurrent first sign-in race): INSERT is silently
  //     skipped, 0 rows returned, transaction remains valid → safe to re-SELECT.
  //   - If email/username uniqueness is violated: 23505 is thrown (not suppressed by
  //     DO NOTHING — it only targets clerk_id). Caught in the inner try-catch and
  //     converted to a typed error before withTransaction's ROLLBACK fires.
  return withTransaction(async (client) => {
    let insertedRows: DbLocalUser[]
    try {
      const res = await client.query<DbLocalUser>(
        `INSERT INTO users (username, email, password_hash, role, status, clerk_id)
         VALUES ($1, $2, NULL, 'user', 'active', $3)
         ON CONFLICT (clerk_id) DO NOTHING
         RETURNING id, username, email, role, status`,
        [chosenUsername, chosenEmail, clerkUserId],
      )
      insertedRows = res.rows
    } catch (err: unknown) {
      const pgErr = err as PgError
      if (pgErr.code === '23505') {
        if (pgErr.constraint?.includes('email')) {
          // Concurrent request created an account with the same real Clerk email
          // between our pre-check and our INSERT — must not auto-link.
          throw new ClerkResolverError(
            'ACCOUNT_LINK_REQUIRED',
            'An account with this email already exists. Log in with your password to link it.',
          )
        }
        if (pgErr.constraint?.includes('username')) {
          // Real Clerk username raced with a concurrent signup → ACCOUNT_LINK_REQUIRED.
          // Fallback (hash-derived) username collision → PROVISIONING_FAILED (extremely rare).
          if (usingClerkUsername) {
            throw new ClerkResolverError(
              'ACCOUNT_LINK_REQUIRED',
              'An account with this username already exists. Log in with your password to link it.',
            )
          }
          throw new ClerkResolverError(
            'PROVISIONING_FAILED',
            'Username collision on provisioning. Please retry.',
          )
        }
      }
      throw err
    }

    // INSERT succeeded — return the new row
    if (insertedRows.length > 0) {
      return insertedRows[0]
    }

    // INSERT returned 0 rows: clerk_id conflict handled by DO NOTHING.
    // Transaction is still valid; re-SELECT the winning row on the same client.
    const race = await client.query<DbLocalUser>(
      `SELECT id, username, email, role, status
       FROM users WHERE clerk_id = $1 LIMIT 1`,
      [clerkUserId],
    )
    if (race.rows.length > 0) {
      const row = race.rows[0]
      if (row.status === 'suspended') {
        throw new ClerkResolverError('ACCOUNT_SUSPENDED', 'Account is suspended.')
      }
      return row
    }

    throw new ClerkResolverError('PROVISIONING_FAILED', 'Provisioning race could not resolve.')
  })
}
