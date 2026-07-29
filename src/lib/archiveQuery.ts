import type { CharacterBuild } from '../types'

export function searchBuilds(builds: CharacterBuild[], query: string): CharacterBuild[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return builds
  return builds.filter((build) => [
    build.name, build.series, build.version, build.franchise,
    ...build.archetype, ...build.combatTags, ...build.customTags,
    ...build.bloodlines.map((slot) => slot.name),
  ].join(' ').toLowerCase().includes(normalized))
}

export function paginateBuilds(builds: CharacterBuild[], page: number, pageSize: number): CharacterBuild[] {
  return builds.slice(Math.max(0, page - 1) * pageSize, Math.max(1, page) * pageSize)
}

export function buildsByOwnership(builds: CharacterBuild[], owned: Set<string>, missingAtMost = 0): CharacterBuild[] {
  return builds.filter((build) => build.bloodlines.filter((slot) => !owned.has(slot.name)).length <= missingAtMost)
}

export function sortBuilds(builds: CharacterBuild[], field: 'name' | 'pvp' | 'accuracy', direction: 'asc' | 'desc') {
  const result = [...builds].sort((left, right) => field === 'name'
    ? left.name.localeCompare(right.name)
    : left.ratings[field] - right.ratings[field])
  return direction === 'asc' ? result : result.reverse()
}
