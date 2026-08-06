import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { query, withTransaction, auditLog } from '../db/index'
import { loginRateLimit } from '../middleware/rateLimit'
import { FREE_CHARACTER_IDS, type ArchiveAccessState, type UserRole } from '../types'

const router = Router()

// ------------------------------------------------------------------ validation

const usernameSchema = z.string().min(3).max(30).refine(
  (v) => /^[a-zA-Z0-9_-]+$/.test(v),
  { message: 'Username may only contain letters, numbers, _ and -' },
)
const emailSchema = z.string().email().max(254)
const passwordSchema = z.string().min(12).max(128)

const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
})

// ------------------------------------------------------------------ helpers

type DbUser = {
  id: string
  username: string
  email: string
  password_hash: string
  role: UserRole
  status: string
}

type DbEntitlement = {
  entitlement_type: string
  resource_mapping: Record<string, unknown>
}

export async function buildAccessState(userId: string): Promise<ArchiveAccessState | null> {
  const userRes = await query<DbUser>(
    `SELECT id, username, email, role, status FROM users WHERE id = $1`,
    [userId],
  )
  const user = userRes.rows[0]
  if (!user || user.status !== 'active') return null

  const entRes = await query<DbEntitlement>(
    `SELECT entitlement_type, resource_mapping
     FROM entitlements
     WHERE user_id = $1
       AND status = 'active'
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId],
  )

  let fullArchive = false
  const characterIds: string[] = []
  let highestPackage: 'starter' | 'plus' | 'full' | null = null
  const hasAnyEntitlement = entRes.rows.length > 0

  for (const ent of entRes.rows) {
    if (ent.entitlement_type === 'full_archive') {
      fullArchive = true
      highestPackage = 'full'
    } else if (ent.entitlement_type === 'pack') {
      const mapping = ent.resource_mapping as { characterIds?: string[]; packageType?: string }
      if (mapping.characterIds) characterIds.push(...mapping.characterIds)
      if (mapping.packageType === 'plus' && highestPackage !== 'full') highestPackage = 'plus'
      else if (mapping.packageType === 'starter' && !highestPackage) highestPackage = 'starter'
    } else if (ent.entitlement_type === 'character') {
      const mapping = ent.resource_mapping as { characterId?: string }
      if (mapping.characterId) characterIds.push(mapping.characterId)
    }
  }

  return {
    status: 'signed-in',
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    entitlement: hasAnyEntitlement ? 'active' : 'missing',
    freeCharacterIds: [...FREE_CHARACTER_IDS],
    characterIds: [...new Set(characterIds)],
    fullArchive,
    highestPackage,
  }
}

function ownerFallbackState(): ArchiveAccessState {
  return {
    status: 'signed-in',
    userId: 'owner',
    username: process.env.OWNER_USERNAME ?? 'owner',
    email: `${process.env.OWNER_USERNAME ?? 'owner'}@archive.internal`,
    role: 'owner',
    entitlement: 'active',
    freeCharacterIds: [...FREE_CHARACTER_IDS],
    characterIds: [],
    fullArchive: true,
    highestPackage: 'full',
  }
}

function dbAvailable(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

// ------------------------------------------------------------------ GET /csrf

router.get('/csrf', (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString('hex')
  }
  res.json({ csrfToken: req.session.csrfToken })
})

// ------------------------------------------------------------------ POST /login

router.post('/login', loginRateLimit, async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string }

  if (!username || !password) {
    res.status(401).json({ error: 'Invalid credentials.' })
    return
  }

  if (!dbAvailable()) {
    const ownerUsername = process.env.OWNER_USERNAME ?? ''
    const ownerHash = process.env.OWNER_PASSWORD_HASH ?? ''
    const usernameOk = username.toLowerCase() === ownerUsername.toLowerCase()
    const passwordOk = ownerHash ? bcrypt.compareSync(password, ownerHash) : false
    if (!usernameOk || !passwordOk) {
      res.status(401).json({ error: 'Invalid credentials.' })
      return
    }
    req.session.regenerate((err) => {
      if (err) { res.status(500).json({ error: 'Session error.' }); return }
      req.session.userId = 'owner'
      req.session.role = 'owner'
      res.json(ownerFallbackState())
    })
    return
  }

  try {
    const userRes = await query<DbUser>(
      `SELECT id, username, email, password_hash, role, status
       FROM users
       WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
       LIMIT 1`,
      [username.trim()],
    )

    const user = userRes.rows[0]
    const hashToCheck = user?.password_hash ?? '$2b$12$invaliddummyhashtopreventtiming0'
    const passwordOk = await bcrypt.compare(password, hashToCheck)

    if (!user || !passwordOk || user.status !== 'active') {
      res.status(401).json({ error: 'Invalid credentials.' })
      return
    }

    await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [user.id])

    req.session.regenerate(async (err) => {
      if (err) { res.status(500).json({ error: 'Session error.' }); return }
      req.session.userId = user.id
      req.session.role = user.role
      const state = await buildAccessState(user.id)
      res.json(state ?? ownerFallbackState())
    })
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

// ------------------------------------------------------------------ POST /logout

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('archive_sid')
    res.json({})
  })
})

// ------------------------------------------------------------------ GET /me

router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    res.json({ status: 'signed-out', freeCharacterIds: [...FREE_CHARACTER_IDS], characterIds: [], fullArchive: false, highestPackage: null } satisfies ArchiveAccessState)
    return
  }

  if (!dbAvailable()) {
    res.json(ownerFallbackState())
    return
  }

  try {
    const state = await buildAccessState(req.session.userId)
    if (!state) {
      req.session.destroy(() => undefined)
      res.json({ status: 'signed-out', freeCharacterIds: [...FREE_CHARACTER_IDS], characterIds: [], fullArchive: false, highestPackage: null } satisfies ArchiveAccessState)
      return
    }
    res.json(state)
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

// ------------------------------------------------------------------ POST /signup

router.post('/signup', async (req, res) => {
  if (!dbAvailable()) {
    res.status(403).json({ error: 'Account creation is not available in this environment.' })
    return
  }

  const parse = signupSchema.safeParse(req.body)
  if (!parse.success) {
    const first = parse.error.issues[0]
    res.status(400).json({ error: first?.message ?? 'Invalid input.' })
    return
  }

  const { username, email, password } = parse.data
  const normalizedUsername = username.trim().toLowerCase()
  const normalizedEmail = email.trim().toLowerCase()

  try {
    const existing = await query(
      `SELECT id FROM users WHERE LOWER(username) = $1 OR LOWER(email) = $2 LIMIT 1`,
      [normalizedUsername, normalizedEmail],
    )
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An account with that username or email already exists.' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await withTransaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `INSERT INTO users (username, email, password_hash, role, status)
         VALUES ($1, $2, $3, 'user', 'active')
         RETURNING id`,
        [normalizedUsername, normalizedEmail, passwordHash],
      )
      await auditLog(client, result.rows[0].id, 'user_signup', 'user', result.rows[0].id, { username: normalizedUsername })
    })

    res.status(201).json({ ok: true })
  } catch {
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

// ------------------------------------------------------------------ POST /forgot-password

router.post('/forgot-password', (_req, res) => {
  res.status(403).json({ error: 'Password reset is not available.' })
})

export { router as authRouter }
