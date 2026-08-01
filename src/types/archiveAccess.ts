import type { CharacterBuild } from '../types'

export type CharacterAccessState = 'Free' | 'Locked' | 'Selected' | 'Owned'

export interface ArchiveBuildRecord extends CharacterBuild {
  accessState: CharacterAccessState
  publicVariantCount: number
  publicAvailableSlotCounts: number[]
}
