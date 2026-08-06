import { Router } from 'express'
import { FREE_CHARACTER_IDS } from '../types'

const router = Router()

router.get('/access', (req, res) => {
  const freeCharacterIds = [...FREE_CHARACTER_IDS]
  if (req.session.userId) {
    res.json({
      status: 'signed-in',
      email: req.session.userId,
      entitlement: 'active',
      freeCharacterIds,
      characterIds: [],
      fullArchive: true,
      highestPackage: 'full',
    })
  } else {
    res.json({
      status: 'signed-out',
      freeCharacterIds,
      characterIds: [],
      fullArchive: false,
      highestPackage: null,
    })
  }
})

export { router as archiveRouter }
