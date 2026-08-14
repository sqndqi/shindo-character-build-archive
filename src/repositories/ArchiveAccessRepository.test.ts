/**
 * Tests for establishClerkSession() in ArchiveAccessRepository.
 *
 * Module-level state (csrfTokenCache, apiBase) is isolated per test via
 * vi.resetModules() + vi.stubEnv() + dynamic import() in beforeEach.
 * globalThis.fetch is replaced with a vi.fn() before each test.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ------------------------------------------------------------------ helpers

const API_BASE = 'https://archive.test'
const CLERK_TOKEN = 'clerk.signed.jwt.token'

type Mod = typeof import('./ArchiveAccessRepository')

/** Minimal signed-in ArchiveAccessState for response mocking. */
const mockState = {
  status: 'signed-in' as const,
  userId: 'local-uuid-001',
  username: 'ck_testuser',
  email: 'test@clerk.test',
  role: 'user' as const,
  entitlement: 'missing' as const,
  freeCharacterIds: [],
  characterIds: [],
  fullArchive: false,
  highestPackage: null,
}

/** Build a Response-like object for vi.fn() fetch. */
function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

// ------------------------------------------------------------------ setup

let mod: Mod

beforeEach(async () => {
  vi.resetModules()
  vi.stubEnv('VITE_ARCHIVE_API_URL', API_BASE)
  globalThis.fetch = vi.fn()
  mod = await import('./ArchiveAccessRepository')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

// ------------------------------------------------------------------ null token

describe('establishClerkSession — null token', () => {
  it('getToken() called before any fetch', async () => {
    const getToken = vi.fn().mockResolvedValue(null)
    await expect(mod.establishClerkSession(getToken)).rejects.toThrow()
    expect(getToken).toHaveBeenCalledTimes(1)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('throws ClerkSessionError with code clerk_token_missing', async () => {
    const getToken = vi.fn().mockResolvedValue(null)
    await expect(mod.establishClerkSession(getToken)).rejects.toMatchObject({
      name: 'ClerkSessionError',
      code: 'clerk_token_missing',
    })
  })

  it('empty string token also rejected as missing', async () => {
    const getToken = vi.fn().mockResolvedValue('')
    await expect(mod.establishClerkSession(getToken)).rejects.toMatchObject({
      code: 'clerk_token_missing',
    })
  })
})

// ------------------------------------------------------------------ request shape

describe('establishClerkSession — request shape', () => {
  beforeEach(() => {
    // CSRF fetch, then clerk-session fetch
    ;(globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf-abc' }))
      .mockResolvedValueOnce(mockResponse(mockState))
  })

  it('sends Authorization: Bearer <token>', async () => {
    const getToken = vi.fn().mockResolvedValue(CLERK_TOKEN)
    await mod.establishClerkSession(getToken)
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['authorization']).toBe(`Bearer ${CLERK_TOKEN}`)
  })

  it('sends x-csrf-token header', async () => {
    const getToken = vi.fn().mockResolvedValue(CLERK_TOKEN)
    await mod.establishClerkSession(getToken)
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['x-csrf-token']).toBe('csrf-abc')
  })

  it('sends credentials: include', async () => {
    const getToken = vi.fn().mockResolvedValue(CLERK_TOKEN)
    await mod.establishClerkSession(getToken)
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string, RequestInit]
    expect(init.credentials).toBe('include')
  })

  it('posts to /v1/auth/clerk-session', async () => {
    const getToken = vi.fn().mockResolvedValue(CLERK_TOKEN)
    await mod.establishClerkSession(getToken)
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string]
    expect(url).toBe(`${API_BASE}/v1/auth/clerk-session`)
  })

  it('sends no Clerk identity fields in body', async () => {
    const getToken = vi.fn().mockResolvedValue(CLERK_TOKEN)
    await mod.establishClerkSession(getToken)
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string, RequestInit]
    const body = init.body ? String(init.body) : ''
    expect(body).not.toContain('userId')
    expect(body).not.toContain('email')
    expect(body).not.toContain('clerk_id')
    expect(body).not.toContain(CLERK_TOKEN)
  })
})

// ------------------------------------------------------------------ success

describe('establishClerkSession — success', () => {
  it('returns ArchiveAccessState unchanged from server', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf-xyz' }))
      .mockResolvedValueOnce(mockResponse(mockState))

    const result = await mod.establishClerkSession(() => Promise.resolve(CLERK_TOKEN))
    expect(result).toEqual(mockState)
  })
})

// ------------------------------------------------------------------ typed errors

describe('establishClerkSession — typed error codes', () => {
  async function callWithServerError(code: string, status: number) {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf' }))
      .mockResolvedValueOnce(mockResponse({ error: 'message', code }, status))
    return mod.establishClerkSession(() => Promise.resolve(CLERK_TOKEN))
  }

  it('ACCOUNT_LINK_REQUIRED => ClerkSessionError code account_link_required', async () => {
    await expect(callWithServerError('ACCOUNT_LINK_REQUIRED', 409)).rejects.toMatchObject({
      name: 'ClerkSessionError',
      code: 'account_link_required',
    })
  })

  it('ACCOUNT_SUSPENDED => ClerkSessionError code account_suspended', async () => {
    await expect(callWithServerError('ACCOUNT_SUSPENDED', 403)).rejects.toMatchObject({
      name: 'ClerkSessionError',
      code: 'account_suspended',
    })
  })

  it('PROVISIONING_FAILED => ClerkSessionError code provisioning_failed', async () => {
    await expect(callWithServerError('PROVISIONING_FAILED', 500)).rejects.toMatchObject({
      name: 'ClerkSessionError',
      code: 'provisioning_failed',
    })
  })
})

// ------------------------------------------------------------------ CSRF retry

describe('establishClerkSession — CSRF retry', () => {
  it('on 403: clears cache, re-fetches CSRF, retries once, succeeds', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf-old' }))  // initial CSRF fetch
      .mockResolvedValueOnce(mockResponse({}, 403))                     // clerk-session: CSRF rejected
      .mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf-new' }))  // retry CSRF fetch
      .mockResolvedValueOnce(mockResponse(mockState))                   // retry clerk-session: ok

    const result = await mod.establishClerkSession(() => Promise.resolve(CLERK_TOKEN))
    expect(result).toEqual(mockState)

    const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls as unknown[][]
    expect((calls[2] as [string])[0]).toContain('/v1/auth/csrf')
    const retryInit = (calls[3] as [string, RequestInit])[1]
    expect((retryInit.headers as Record<string, string>)['x-csrf-token']).toBe('csrf-new')
  })

  it('does not retry more than once — second 403 throws ApiError', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf-1' }))
      .mockResolvedValueOnce(mockResponse({}, 403))
      .mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf-2' }))
      .mockResolvedValueOnce(mockResponse({}, 403))

    await expect(
      mod.establishClerkSession(() => Promise.resolve(CLERK_TOKEN)),
    ).rejects.toMatchObject({ name: 'ApiError' })
  })
})

// ------------------------------------------------------------------ legacy signIn/signUp regressions

describe('signIn / signUp — not broken by Clerk additions', () => {
  it('signIn sends credentials via /v1/auth/login', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf' }))
      .mockResolvedValueOnce(mockResponse(mockState))

    const result = await mod.signIn('testuser', 'TestPassword123!')
    expect(result).toEqual(mockState)

    const calls1 = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls as unknown[][]
    const [url, init] = calls1[1] as [string, RequestInit]
    expect(url).toBe(`${API_BASE}/v1/auth/login`)
    expect(init.method).toBe('POST')
    const body = JSON.parse(init.body as string) as { username: string; password: string }
    expect(body.username).toBe('testuser')
    expect(body.password).toBe('TestPassword123!')
  })

  it('signUp sends to /v1/auth/signup', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf' }))
      .mockResolvedValueOnce(mockResponse({ ok: true }))

    const result = await mod.signUp('newuser', 'new@example.com', 'SomePass123!')
    expect(result).toEqual({ ok: true })

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string]
    expect(url).toBe(`${API_BASE}/v1/auth/signup`)
  })
})
