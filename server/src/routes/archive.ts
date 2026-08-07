import { Router } from 'express'
import { FREE_CHARACTER_IDS, type ArchiveAccessState } from '../types'
import { buildAccessState } from './auth'

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
    res.json({
      status: 'signed-in',
      userId: 'owner',
      username: process.env.OWNER_USERNAME ?? 'owner',
      email: `${process.env.OWNER_USERNAME ?? 'owner'}@archive.internal`,
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
