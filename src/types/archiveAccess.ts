import type { CharacterBuild } from '../types'

export type CharacterAccessState = 'Free' | 'Locked' | 'Selected' | 'Owned'

/**
 * Why an owned/free build's full detail could not be loaded.
 * 'denied'      — server returned 401/403 (entitlement genuinely absent/changed)
 * 'missing'     — server returned 404 (build not present in the catalog)
 * 'unavailable' — 5xx or network failure (transient; ownership is still valid)
 */
export type BuildLoadErrorKind = 'denied' | 'missing' | 'unavailable'

export interface ArchiveBuildRecord extends CharacterBuild {
  accessState: CharacterAccessState
  publicVariantCount: number
  publicAvailableSlotCounts: number[]
  /** Set only when the full build failed to load; the accessState is still authoritative. */
  buildLoadError?: BuildLoadErrorKind
}
