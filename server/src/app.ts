import express, { type Request } from 'express'
import session from 'express-session'
import cors from 'cors'
import connectPgSimple from 'connect-pg-simple'
import { authRouter } from './routes/auth'
import { archiveRouter } from './routes/archive'
import { accountRouter } from './routes/account'
import { productsRouter } from './routes/products'
import { paymentsRouter } from './routes/payments'
import { webhooksRouter } from './routes/webhooks'
import { adminRouter } from './routes/admin'
import { csrfProtect } from './middleware/csrf'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) throw new Error('SESSION_SECRET env var is required')

const PgSession = connectPgSimple(session)

interface CookieOverrides {
  sameSite?: boolean | 'lax' | 'none' | 'strict'
  secure?: boolean
}

export function createApp(cookieOverrides?: CookieOverrides) {
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd && !process.env.DATABASE_URL) {
    throw new Error('[server] DATABASE_URL is required in production. Set it before starting.')
  }
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'test') {
    console.warn('[server] WARNING: DATABASE_URL not set — using in-memory session store. Sessions will not persist. Not suitable for production.')
  }

  const allowedOrigins: string[] = [
    process.env.FRONTEND_ORIGIN,
    ...(!isProd ? ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'] : []),
  ].filter(Boolean) as string[]

  const app = express()

  app.set('trust proxy', 1)

  // Capture raw body for webhook HMAC-SHA512 verification before JSON parsing consumes the stream
  app.use(
    express.json({
      verify: (req: Request, _res, buf) => {
        ;(req as Request & { rawBody?: Buffer }).rawBody = buf
      },
    }),
  )

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, false)
          return
        }
        if (allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(null, false)
        }
      },
      credentials: true,
    }),
  )

  const sessionStore = process.env.DATABASE_URL
    ? new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'sessions',
        createTableIfMissing: true,
      })
    : undefined

  app.use(
    session({
      name: 'archive_sid',
      secret: sessionSecret!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: cookieOverrides?.secure ?? isProd,
        sameSite: cookieOverrides?.sameSite ?? (isProd ? 'none' : 'lax'),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  )

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  // Webhooks: no CSRF — external POST verified by HMAC-SHA512 signature
  app.use('/v1/webhooks', webhooksRouter)

  // All other routes: CSRF protection on mutations (middleware skips GET/HEAD/OPTIONS automatically)
  app.use('/v1/auth', csrfProtect, authRouter)
  app.use('/v1/archive', archiveRouter)
  app.use('/v1/products', productsRouter)
  app.use('/v1/account', csrfProtect, accountRouter)
  app.use('/v1/payments', csrfProtect, paymentsRouter)
  app.use('/v1/admin', csrfProtect, adminRouter)

  return app
}

export const app = createApp()
