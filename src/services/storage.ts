import type { CharacterBuild } from '../types'

export const STORAGE_KEYS = {
  builds: 'shindo-build-archive:v1',
  preferences: 'shindo-build-archive:prefs:v1',
  migration: 'shindo-build-archive:migration-version',
  backupPrefix: 'shindo-build-archive:backup:',
} as const

let pendingSave: number | undefined
let pendingBuilds: CharacterBuild[] | undefined

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function backupRawBuildData(raw: string, version: number): void {
  try {
    const key = `${STORAGE_KEYS.backupPrefix}v${version}:${new Date().toISOString()}`
    localStorage.setItem(key, raw)
  } catch {
    // A failed backup must never prevent the archive from opening.
  }
}

export function scheduleBuildSave(builds: CharacterBuild[], delay = 180): void {
  pendingBuilds = builds
  if (pendingSave) window.clearTimeout(pendingSave)
  pendingSave = window.setTimeout(flushBuildSave, delay)
}

export function flushBuildSave(): boolean {
  if (!pendingBuilds) return true
  const result = writeStorage(STORAGE_KEYS.builds, pendingBuilds)
  pendingBuilds = undefined
  pendingSave = undefined
  return result
}

export function storageBytes(): number {
  try {
    return new Blob(Object.entries(localStorage).map(([key, value]) => `${key}${value}`)).size
  } catch {
    return 0
  }
}
