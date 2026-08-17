import type { BuildVariant, CharacterBuild } from '../types'
import type { ArchiveBuildRecord, BuildLoadErrorKind, CharacterAccessState } from '../types/archiveAccess'
import { publicBuildPreviews } from '../data/publicBuildPreviews'
import { freeBuilds } from '../data/freeBuilds'

/** Thrown by getBuild so callers can distinguish denial from a transient outage. */
export class BuildFetchError extends Error {
  readonly kind: BuildLoadErrorKind
  constructor(kind: BuildLoadErrorKind, message: string) {
    super(message)
    this.name = 'BuildFetchError'
    this.kind = kind
  }
}

export interface BuildPreview {
  id: string
  name: string
  series: string
  version: string
  image: string
  thumbnail?: string
  archetype: string[]
  variantCount: number
  free: boolean
  media?: 'Manhwa' | 'Manga / Anime'
}
export type PublicBuildPreview = BuildPreview

export interface BuildRepository {
  listBuildPreviews(): Promise<BuildPreview[]>
  getBuild(id: string): Promise<CharacterBuild>
  listVariants(buildId: string): Promise<BuildVariant[]>
  listAccess(): Promise<{ freeCharacterIds: string[]; characterIds: string[]; fullArchive: boolean }>
}

const apiBase = (import.meta.env.VITE_ARCHIVE_API_URL as string | undefined)?.replace(/\/$/, '')

class PublicBuildRepository implements BuildRepository {
  async listBuildPreviews() {
    return structuredClone(publicBuildPreviews).map((preview) => ({
      ...preview,
      media: preview.id.startsWith('anime-') ? 'Manga / Anime' as const : 'Manhwa' as const,
    }))
  }

  async getBuild(id: string) {
    const free = freeBuilds.find((item) => item.id === id)
    if (free) return structuredClone(free)
    if (!apiBase) throw new BuildFetchError('unavailable', 'The premium build service is not configured.')
    let response: Response
    try {
      response = await fetch(`${apiBase}/v1/archive/builds/${encodeURIComponent(id)}`, { credentials: 'include' })
    } catch {
      // Network failure — transient. Ownership, if known, remains valid.
      throw new BuildFetchError('unavailable', 'The premium build service is unavailable.')
    }
    if (response.status === 401 || response.status === 403) {
      throw new BuildFetchError('denied', 'You do not have access to this build.')
    }
    if (response.status === 404) {
      throw new BuildFetchError('missing', 'This build is not available yet.')
    }
    if (!response.ok) {
      throw new BuildFetchError('unavailable', 'The premium build service is unavailable.')
    }
    return response.json() as Promise<CharacterBuild>
  }

  async listVariants(buildId: string) {
    return (await this.getBuild(buildId)).variants
  }

  async listAccess() {
    const fallback = { freeCharacterIds: freeBuilds.map((build) => build.id), characterIds: [], fullArchive: false }
    if (!apiBase) return fallback
    try {
      const response = await fetch(`${apiBase}/v1/archive/access`, { credentials: 'include' })
      if (!response.ok) return fallback
      const data = await response.json() as Record<string, unknown>
      return {
        freeCharacterIds: Array.isArray(data.freeCharacterIds) ? data.freeCharacterIds as string[] : fallback.freeCharacterIds,
        characterIds: Array.isArray(data.characterIds) ? data.characterIds as string[] : [],
        fullArchive: data.fullArchive === true,
      }
    } catch {
      return fallback
    }
  }
}

const placeholderRatings = { accuracy: 0, pvp: 0, mobility: 0, combos: 0, defense: 0, visuals: 0, aura: 0, difficulty: 0 }

export function previewToRecord(preview: BuildPreview, accessState: CharacterAccessState): ArchiveBuildRecord {
  const free = freeBuilds.find((build) => build.id === preview.id)
  if (free) return {
    ...structuredClone(free),
    accessState: 'Free',
    publicVariantCount: preview.variantCount,
    publicAvailableSlotCounts: [...new Set(free.variants.map((variant) => variant.bloodlineSlotCount))].sort(),
  }
  return {
    id: preview.id,
    characterId: `character-${preview.id}`,
    versionId: `version-${preview.id}`,
    buildName: `${preview.name} — ${preview.version}`,
    name: preview.name,
    series: preview.series,
    franchise: preview.series,
    version: preview.version,
    image: preview.image,
    thumbnail: preview.thumbnail,
    description: 'Premium build details remain private until this character is unlocked.',
    archetype: preview.archetype,
    combatTags: preview.archetype,
    customTags: [],
    effectsIntensity: 'Low',
    bloodlines: [],
    elements: [],
    cMode: 'Locked',
    zMode: 'Locked',
    combatArt: 'Locked',
    weapon: 'Locked',
    ninjaTool: 'Locked',
    consumable: 'Locked',
    mentor: 'Locked',
    race: 'Locked',
    hotbar: [],
    combos: [],
    strengths: [],
    weaknesses: [],
    substitutions: [],
    ratings: placeholderRatings,
    slotAlternatives: { twoSlots: [], threeSlots: [], fourSlots: [] },
    variations: { beginner: '', meta: '', lore: '' },
    notes: '',
    status: 'Draft',
    gameUpdate: '',
    lastVerifiedUpdate: '',
    verificationStatus: 'Needs Retesting',
    createdAt: '',
    updatedAt: '',
    testing: { status: 'Untested', contexts: [], tester: '', testDate: '', notes: '' },
    changeHistory: [],
    chapterRange: 'Preview only',
    characterAbilities: preview.archetype,
    knownCompromises: [],
    confidence: 'Unverified',
    publicationStatus: 'Draft',
    evidence: [],
    variants: [],
    accessState,
    publicVariantCount: preview.variantCount,
    publicAvailableSlotCounts: [],
  } as ArchiveBuildRecord
}

export const buildRepository: BuildRepository = new PublicBuildRepository()
