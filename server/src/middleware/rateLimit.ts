import rateLimit from 'express-rate-limit'

export const loginRateLimit = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  limit: Number(process.env.RATE_LIMIT_MAX ?? 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Please try again later.' },
})

export const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.SIGNUP_RATE_LIMIT_MAX ?? 5),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { error: 'Too many requests. Please try again later.' },
})

export const redeemRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.REDEEM_RATE_LIMIT_MAX ?? 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { error: 'Too many requests. Please try again later.' },
})

export const checkoutRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.CHECKOUT_RATE_LIMIT_MAX ?? 3),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { error: 'Too many requests. Please try again later.' },
})

export const adminMutationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: Number(process.env.ADMIN_MUTATION_RATE_LIMIT_MAX ?? 30),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { error: 'Too many requests. Please try again later.' },
})

// Stricter limiter applied only to the reconcile endpoint (on top of adminMutationRateLimit).
// Reconciliation grants entitlements — bursting it is high-risk so the window is tighter.
export const reconcileRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: Number(process.env.RECONCILE_RATE_LIMIT_MAX ?? 5),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { error: 'Too many reconciliation requests. Please try again later.' },
})
