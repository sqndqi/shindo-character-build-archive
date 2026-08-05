import bcrypt from 'bcryptjs'

// Must set all env vars before any test file imports app.ts
process.env.OWNER_USERNAME = 'sendai'
process.env.SESSION_SECRET = 'test-session-secret-at-least-32-chars-long'
process.env.FRONTEND_ORIGIN = 'http://localhost:5173'
process.env.NODE_ENV = 'test'
process.env.RATE_LIMIT_MAX = '3'
process.env.RATE_LIMIT_WINDOW_MS = '60000'

// bcrypt rounds=4 is intentionally low for test speed
process.env.OWNER_PASSWORD_HASH = bcrypt.hashSync('TestPassword123!', 4)
