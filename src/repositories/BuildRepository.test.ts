/**
 * Tests for BuildRepository.getBuild error-state behavior.
 *
 * getBuild must translate transport outcomes into typed BuildFetchError kinds so
 * the app can keep an Owned build Owned on transient failure and only treat a
 * genuine 401/403 as denial. Module-level apiBase is set via vi.stubEnv() +
 * dynamic import per test; globalThis.fetch is mocked.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { freeBuilds } from '../data/freeBuilds'

const API_BASE = 'https://archive.test'
type Mod = typeof import('./BuildRepository')

function mockResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

let mod: Mod

beforeEach(async () => {
  vi.resetModules()
  vi.stubEnv('VITE_ARCHIVE_API_URL', API_BASE)
  globalThis.fetch = vi.fn()
  mod = await import('./BuildRepository')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('getBuild — free builds', () => {
  it('returns local free build data without any network call', async () => {
    const freeId = freeBuilds[0].id
    const build = await mod.buildRepository.getBuild(freeId)
    expect(build.id).toBe(freeId)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})

describe('getBuild — premium error mapping', () => {
  it('maps 403 to BuildFetchError kind "denied"', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse({ error: 'Forbidden.' }, 403))
    await expect(mod.buildRepository.getBuild('gun-park')).rejects.toMatchObject({
      name: 'BuildFetchError',
      kind: 'denied',
    })
  })

  it('maps 401 to BuildFetchError kind "denied"', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse({ error: 'Auth required.' }, 401))
    await expect(mod.buildRepository.getBuild('gun-park')).rejects.toMatchObject({ kind: 'denied' })
  })

  it('maps 404 to BuildFetchError kind "missing"', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse({ error: 'Not found.' }, 404))
    await expect(mod.buildRepository.getBuild('gun-park')).rejects.toMatchObject({ kind: 'missing' })
  })

  it('maps 500 to BuildFetchError kind "unavailable"', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse({ error: 'Server error.' }, 500))
    await expect(mod.buildRepository.getBuild('gun-park')).rejects.toMatchObject({ kind: 'unavailable' })
  })

  it('maps a network/fetch rejection to kind "unavailable"', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(mod.buildRepository.getBuild('gun-park')).rejects.toMatchObject({ kind: 'unavailable' })
  })

  it('returns the full build on 200', async () => {
    const payload = { id: 'gun-park', name: 'Gun Park', variants: [{ id: 'v1' }] }
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse(payload, 200))
    const build = await mod.buildRepository.getBuild('gun-park')
    expect(build.id).toBe('gun-park')
  })
})
