import type { Request, Response, NextFunction } from 'express'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }
  next()
}

export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId || req.session.role !== 'owner') {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.userId || !roles.includes(req.session.role ?? '')) {
      res.status(403).json({ error: 'Forbidden.' })
      return
    }
    next()
  }
}
