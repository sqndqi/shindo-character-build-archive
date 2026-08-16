import bcrypt from 'bcryptjs'
import { vi } from 'vitest'

// Stub @clerk/express so clerkMiddleware() is a no-op pass-through in tests.
// No Clerk credentials are needed or used; no network contact occurs.
vi.mock('@clerk/express', () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}))

// Must set all env vars before any test file imports app.ts
process.env.OWNER_USERNAME = 'sendai'
process.env.OWNER_2_USERNAME = 'secondowner'
process.env.SESSION_SECRET = 'test-session-secret-at-least-32-chars-long'
process.env.FRONTEND_ORIGIN = 'http://localhost:5173'
process.env.NODE_ENV = 'test'
process.env.RATE_LIMIT_MAX = '3'
process.env.RATE_LIMIT_WINDOW_MS = '60000'

// bcrypt rounds=4 is intentionally low for test speed
process.env.OWNER_PASSWORD_HASH = bcrypt.hashSync('TestPassword123!', 4)
process.env.OWNER_2_PASSWORD_HASH = bcrypt.hashSync('SecondPassword123!', 4)
process.env.NOWPAYMENTS_IPN_SECRET = 'test-ipn-secret-for-testing-only'
