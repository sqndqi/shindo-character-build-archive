import express from 'express'
import session from 'express-session'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { archiveRouter } from './routes/archive'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) throw new Error('SESSION_SECRET env var is required')

const allowedOrigins: string[] = [
  process.env.FRONTEND_ORIGIN,
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173']
    : []),
].filter(Boolean) as string[]

const app = express()

app.set('trust proxy', 1)
app.use(express.json())

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

app.use(
  session({
    name: 'archive_sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/v1/auth', authRouter)
app.use('/v1/archive', archiveRouter)

export { app }
