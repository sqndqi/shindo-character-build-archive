import type { BuildVariant, CharacterBuild } from '../types'
import { completeRoster } from '../data/restoredRoster'

export interface BuildPreview {
  id: string
  name: string
  series: string
  franchise: string
  media?: CharacterBuild['media']
  version: string
  image: string
  thumbnail?: string
  publicationStatus: CharacterBuild['publicationStatus']
  verificationStatus: BuildVariant['verificationStatus']
  lastVerifiedUpdate: string
}

export interface BuildRepository {
  listBuildPreviews(): Promise<BuildPreview[]>
  getBuild(id: string): Promise<CharacterBuild>
  listVariants(buildId: string): Promise<BuildVariant[]>
}

class LocalBuildRepository implements BuildRepository {
  private readonly roster = completeRoster

  async listBuildPreviews() {
    return this.roster.map((build) => {
      const primary = build.variants.find((variant) => variant.type === 'Primary') ?? build.variants[0]
      return {
        id: build.id,
        name: build.name,
        series: build.series,
        franchise: build.franchise,
        media: build.media,
        version: build.version,
        image: build.image,
        thumbnail: build.thumbnail,
        publicationStatus: build.publicationStatus,
        verificationStatus: primary.verificationStatus,
        lastVerifiedUpdate: primary.lastVerifiedUpdate,
      }
    })
  }

  async getBuild(id: string) {
    const build = this.roster.find((item) => item.id === id)
    if (!build) throw new Error('Build is not available in the archive.')
    return structuredClone(build)
  }

  async listVariants(buildId: string) {
    return (await this.getBuild(buildId)).variants
  }
}

export const buildRepository: BuildRepository = new LocalBuildRepository()
