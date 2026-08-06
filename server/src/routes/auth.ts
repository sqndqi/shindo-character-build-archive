import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { timingSafeEqual } from 'crypto'
import { loginRateLimit } from '../middleware/rateLimit'
import type { ArchiveAccessState } from '../types'

const router = Router()

function ownerState(): ArchiveAccessState {
  return {
    status: 'signed-in',
    email: process.env.OWNER_USERNAME ?? 'owner',
    entitlement: 'active',
    fullArchive: true,
    characterIds: [],
    highestPackage: 'full',
  }
}

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) {
    timingSafeEqual(aBuf, Buffer.alloc(aBuf.length))
    return false
  }
  return timingSafeEqual(aBuf, bBuf)
}

router.post('/login', loginRateLimit, (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string }
  const ownerUsername = process.env.OWNER_USERNAME ?? ''
  const ownerHash = process.env.OWNER_PASSWORD_HASH ?? ''

  const usernameMatch = safeCompare(username ?? '', ownerUsername)
  const passwordMatch = ownerHash ? bcrypt.compareSync(password ?? '', ownerHash) : false

  if (!usernameMatch || !passwordMatch) {
    res.status(401).json({ error: 'Invalid credentials.' })
    return
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).json({ error: 'Session error.' })
      return
    }
    req.session.userId = ownerUsername
    req.session.fullArchive = true
    res.json(ownerState())
  })
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('archive_sid')
    res.json({})
  })
})

router.get('/me', (req, res) => {
  if (req.session.userId) {
    res.json(ownerState())
  } else {
    res.json({ status: 'signed-out' } satisfies ArchiveAccessState)
  }
})

router.post('/signup', (_req, res) => {
  res.status(403).json({ error: 'Account creation is not available.' })
})

router.post('/forgot-password', (_req, res) => {
  res.status(403).json({ error: 'Password reset is not available.' })
})

export { router as authRouter }
