import type { BuildVariant, CharacterBuild } from '../types'
import { curatedBuilds } from '../data/curatedBuilds'

export interface BuildPreview {
  id: string
  name: string
  series: string
  franchise: string
  version: string
  image: string
  verificationStatus: BuildVariant['verificationStatus']
  lastVerifiedUpdate: string
}

export interface BuildRepository {
  listBuildPreviews(): Promise<BuildPreview[]>
  getBuild(id: string): Promise<CharacterBuild>
  listVariants(buildId: string): Promise<BuildVariant[]>
}

class LocalBuildRepository implements BuildRepository {
  private readonly reviewed = curatedBuilds.filter((build) => build.publicationStatus === 'Reviewed')

  async listBuildPreviews() {
    return this.reviewed.map((build) => {
      const primary = build.variants[0]
      return {
        id: build.id,
        name: build.name,
        series: build.series,
        franchise: build.franchise,
        version: build.version,
        image: build.image,
        verificationStatus: primary.verificationStatus,
        lastVerifiedUpdate: primary.lastVerifiedUpdate,
      }
    })
  }

  async getBuild(id: string) {
    const build = this.reviewed.find((item) => item.id === id)
    if (!build) throw new Error('Build is not available in the reviewed archive.')
    return structuredClone(build)
  }

  async listVariants(buildId: string) {
    return (await this.getBuild(buildId)).variants
  }
}

export const buildRepository: BuildRepository = new LocalBuildRepository()
