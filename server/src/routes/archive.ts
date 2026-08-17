import { Router } from 'express'
import { FREE_CHARACTER_IDS, type ArchiveAccessState } from '../types'
import { buildAccessState } from './auth'
import { PRIMARY_FALLBACK_SESSION_ID, fallbackOwnerBySessionId } from '../config/owners'
import { query } from '../db/index'
import { getPremiumBuild } from '../premiumCatalog'

const router = Router()

const FREE_IDS = new Set<string>(FREE_CHARACTER_IDS)
// Canonical build ids are lowercase slugs (e.g. "gun-park"). Anything else is rejected
// as a 404 without touching the DB, so malformed ids cannot probe or enumerate.
const CANONICAL_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type DbUser = { id: string; status: string }
type DbEntitlement = { entitlement_type: string; resource_mapping: Record<string, unknown> }

router.get('/access', async (req, res) => {
  const freeCharacterIds = [...FREE_CHARACTER_IDS]

  if (!req.session.userId) {
    res.json({
      status: 'signed-out',
      freeCharacterIds,
      characterIds: [],
      fullArchive: false,
      highestPackage: null,
    } satisfies ArchiveAccessState)
    return
  }

  if (!process.env.DATABASE_URL) {
    // No database: report the owner slot this session belongs to, so a second
    // configured owner is not mistaken for the primary one.
    const owner = fallbackOwnerBySessionId(req.session.userId)
    const username = owner?.username ?? process.env.OWNER_USERNAME ?? 'owner'
    res.json({
      status: 'signed-in',
      userId: owner?.sessionUserId ?? PRIMARY_FALLBACK_SESSION_ID,
      username,
      email: owner?.email ?? `${username}@archive.internal`,
      role: 'owner',
      entitlement: 'active',
      freeCharacterIds,
      characterIds: [],
      fullArchive: true,
      highestPackage: 'full',
    } satisfies ArchiveAccessState)
    return
  }

  try {
    const state = await buildAccessState(req.session.userId)
    if (!state) {
      req.session.destroy(() => undefined)
      res.json({
        status: 'signed-out',
        freeCharacterIds,
        characterIds: [],
        fullArchive: false,
        highestPackage: null,
      } satisfies ArchiveAccessState)
      return
    }
    res.json(state)
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

/**
 * Server-side authorization decision for a single premium build.
 * Reads ONLY PostgreSQL entitlements — never frontend state, query params, body,
 * Clerk metadata, username, or localStorage. Revoked/expired entitlements are
 * excluded by the WHERE clause.
 */
export async function isAuthorizedForBuild(userId: string, buildId: string): Promise<boolean> {
  const userRes = await query<DbUser>(`SELECT id, status FROM users WHERE id = $1`, [userId])
  const user = userRes.rows[0]
  if (!user || user.status !== 'active') return false

  const entRes = await query<DbEntitlement>(
    `SELECT entitlement_type, resource_mapping
     FROM entitlements
     WHERE user_id = $1
       AND status = 'active'
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId],
  )

  for (const ent of entRes.rows) {
    if (ent.entitlement_type === 'full_archive') return true
    if (ent.entitlement_type === 'character') {
      const mapping = ent.resource_mapping as { characterId?: string }
      if (mapping.characterId === buildId) return true
    } else if (ent.entitlement_type === 'pack') {
      const mapping = ent.resource_mapping as { characterIds?: string[] }
      if (Array.isArray(mapping.characterIds) && mapping.characterIds.includes(buildId)) return true
    }
  }
  return false
}

// GET /v1/archive/builds/:id — full CharacterBuild for an authorized user only.
router.get('/builds/:id', async (req, res) => {
  const buildId = req.params.id

  // Malformed id: 404, no DB touch, no enumeration signal.
  if (!CANONICAL_ID.test(buildId)) {
    res.status(404).json({ error: 'Build not found.' })
    return
  }

  // Free builds are public content; serve without auth when present in the catalog.
  // (The frontend serves free builds locally, so this is a safety net, not the main path.)
  if (FREE_IDS.has(buildId)) {
    const freeBuild = getPremiumBuild(buildId)
    if (!freeBuild) { res.status(404).json({ error: 'Build not found.' }); return }
    res.json(freeBuild)
    return
  }

  if (!req.session.userId) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  // No database: only owner-fallback sessions exist, and they have full archive access.
  if (!process.env.DATABASE_URL) {
    if (req.session.role !== 'owner') {
      res.status(403).json({ error: 'Forbidden.' })
      return
    }
    const build = getPremiumBuild(buildId)
    if (!build) { res.status(404).json({ error: 'Build not found.' }); return }
    res.json(build)
    return
  }

  try {
    const authorized = await isAuthorizedForBuild(req.session.userId, buildId)
    if (!authorized) {
      res.status(403).json({ error: 'Forbidden.' })
      return
    }
    const build = getPremiumBuild(buildId)
    if (!build) {
      res.status(404).json({ error: 'Build not found.' })
      return
    }
    res.json(build)
  } catch (err) {
    // Safe observability: identifies the failure without leaking secrets.
    console.error('premium_build_fetch_failed', {
      buildId,
      userId: req.session.userId,
      failure: err instanceof Error ? err.name : 'unknown',
    })
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

export { router as archiveRouter }
