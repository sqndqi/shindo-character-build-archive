import { Router } from 'express'
import type { ArchiveAccessState } from '../types'

const router = Router()

router.get('/access', (req, res) => {
  if (req.session.userId) {
    const state: ArchiveAccessState = {
      status: 'signed-in',
      email: req.session.userId,
      entitlement: 'active',
      fullArchive: true,
      characterIds: [],
      highestPackage: 'full',
    }
    res.json(state)
  } else {
    res.json({ status: 'signed-out' } satisfies ArchiveAccessState)
  }
})

export { router as archiveRouter }
