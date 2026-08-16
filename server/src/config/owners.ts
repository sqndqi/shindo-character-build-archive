/**
 * Owner slot configuration.
 *
 * The archive supports two env-configured owner accounts. This module is the
 * single place that maps env vars to owner slots, so routes never re-derive
 * that mapping and no username is ever hardcoded.
 *
 * Authorization itself is role-based and lives in middleware/auth.ts — nothing
 * here grants privileges. These helpers exist only for the no-database
 * fallback path, where there are no local user rows to authenticate against.
 * When DATABASE_URL is configured, owners authenticate through the users table
 * exactly like any other account.
 */

export interface OwnerSlot {
  /** Session user id used when no database is configured. */
  sessionUserId: string
  usernameVar: string
  passwordHashVar: string
}

/**
 * Slot order is stable and must not change: 'owner' is the primary slot's
 * historical session id and is relied on by existing sessions.
 */
export const OWNER_SLOTS: readonly OwnerSlot[] = [
  {
    sessionUserId: 'owner',
    usernameVar: 'OWNER_USERNAME',
    passwordHashVar: 'OWNER_PASSWORD_HASH',
  },
  {
    sessionUserId: 'owner-2',
    usernameVar: 'OWNER_2_USERNAME',
    passwordHashVar: 'OWNER_2_PASSWORD_HASH',
  },
]

/** Session user id of the primary owner in the no-database fallback path. */
export const PRIMARY_FALLBACK_SESSION_ID = OWNER_SLOTS[0].sessionUserId

export interface FallbackOwner {
  sessionUserId: string
  username: string
  email: string
  /** bcrypt hash. Never log or serialize this value. */
  passwordHash: string
}

function isPresent(value: string | undefined): boolean {
  return Boolean(value?.trim())
}

function ownerEmail(username: string): string {
  return `${username}@archive.internal`
}

/**
 * Returns every fully configured owner slot.
 * A slot is included only when both its username and password hash are set,
 * so a half-configured second owner is never treated as a usable account.
 */
export function listFallbackOwners(env: NodeJS.ProcessEnv = process.env): FallbackOwner[] {
  const owners: FallbackOwner[] = []

  for (const slot of OWNER_SLOTS) {
    const username = env[slot.usernameVar]
    const passwordHash = env[slot.passwordHashVar]
    if (!isPresent(username) || !isPresent(passwordHash)) continue

    const trimmed = (username as string).trim()
    owners.push({
      sessionUserId: slot.sessionUserId,
      username: trimmed,
      email: ownerEmail(trimmed.toLowerCase()),
      passwordHash: (passwordHash as string).trim(),
    })
  }

  return owners
}

/** Finds a configured owner slot by its fallback session user id. */
export function fallbackOwnerBySessionId(
  sessionUserId: string,
  env: NodeJS.ProcessEnv = process.env,
): FallbackOwner | null {
  return listFallbackOwners(env).find((owner) => owner.sessionUserId === sessionUserId) ?? null
}

/** Finds a configured owner slot by case-insensitive username. */
export function fallbackOwnerByUsername(
  username: string,
  env: NodeJS.ProcessEnv = process.env,
): FallbackOwner | null {
  const target = username.trim().toLowerCase()
  if (!target) return null
  return listFallbackOwners(env).find((owner) => owner.username.toLowerCase() === target) ?? null
}
