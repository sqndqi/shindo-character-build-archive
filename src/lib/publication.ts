import type { CharacterBuild } from '../types'

const statusOrder: Record<CharacterBuild['publicationStatus'], number> = {
  Reviewed: 0,
  'Needs Retesting': 1,
  Draft: 2,
  'Needs Research': 3,
}

export function comparePublicationStatus(left: CharacterBuild, right: CharacterBuild) {
  return statusOrder[left.publicationStatus] - statusOrder[right.publicationStatus]
}
