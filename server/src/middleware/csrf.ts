import type { Request, Response, NextFunction } from 'express'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function csrfProtect(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  const token = req.headers['x-csrf-token'] as string | undefined
  const sessionToken = req.session.csrfToken

  if (!token || !sessionToken || token !== sessionToken) {
    res.status(403).json({ error: 'Invalid or missing CSRF token.' })
    return
  }

  const origin = req.headers['origin'] as string | undefined
  const referer = req.headers['referer'] as string | undefined
  const frontendOrigin = process.env.FRONTEND_ORIGIN

  if (frontendOrigin && origin && origin !== frontendOrigin) {
    res.status(403).json({ error: 'Origin not allowed.' })
    return
  }

  if (frontendOrigin && !origin && referer && !referer.startsWith(frontendOrigin)) {
    res.status(403).json({ error: 'Referer not allowed.' })
    return
  }

  next()
}
