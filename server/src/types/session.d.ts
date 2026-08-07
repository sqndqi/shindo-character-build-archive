import 'express-session'
import type { UserRole } from './index'

declare module 'express-session' {
  interface SessionData {
    userId?: string   // UUID from users table
    role?: UserRole
    csrfToken?: string
  }
}
