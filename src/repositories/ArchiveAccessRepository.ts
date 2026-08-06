export type ArchiveAccessState =
  | { status: 'signed-out' }
  | {
    status: 'signed-in'
    email: string
    entitlement: 'active' | 'missing' | 'revoked'
    characterIds?: string[]
    fullArchive?: boolean
    highestPackage?: 'starter' | 'plus' | 'full' | null
  }

export interface ArchiveAccessRepository {
  signIn(identifier: string, password: string): Promise<ArchiveAccessState>
  signUp(email: string, password: string): Promise<{ accepted: true }>
  requestPasswordReset(email: string): Promise<{ accepted: true }>
  getAccessState(): Promise<ArchiveAccessState>
  signOut(): Promise<void>
}

const apiBase = (import.meta.env.VITE_ARCHIVE_API_URL as string | undefined)?.replace(/\/$/, '')

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBase) throw new Error('The staging account API is not configured.')
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string }
    throw new Error(payload.error || 'Account request failed.')
  }
  return response.json() as Promise<T>
}

class HttpArchiveAccessRepository implements ArchiveAccessRepository {
  signIn(identifier: string, password: string) {
    return apiRequest<ArchiveAccessState>('/v1/auth/login', { method: 'POST', body: JSON.stringify({ username: identifier, password }) })
  }
  signUp(email: string, password: string) {
    return apiRequest<{ accepted: true }>('/v1/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) })
  }
  requestPasswordReset(email: string) {
    return apiRequest<{ accepted: true }>('/v1/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
  }
  getAccessState() {
    return apiRequest<ArchiveAccessState>('/v1/auth/me')
  }
  async signOut() {
    await apiRequest('/v1/auth/logout', { method: 'POST' })
  }
}

export const archiveAccessRepository: ArchiveAccessRepository = new HttpArchiveAccessRepository()
export const archiveAccountApiConfigured = Boolean(apiBase)
