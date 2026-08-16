import { Router } from 'express'
import { FREE_CHARACTER_IDS, type ArchiveAccessState } from '../types'
import { buildAccessState } from './auth'
import { PRIMARY_FALLBACK_SESSION_ID, fallbackOwnerBySessionId } from '../config/owners'

const router = Router()

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

export { router as archiveRouter }
