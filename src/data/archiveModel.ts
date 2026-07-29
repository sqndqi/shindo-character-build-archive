import type { Build, Character, CharacterBuild, CharacterVersion } from '../types'

export function toNormalizedArchive(records: CharacterBuild[]): {
  characters: Character[]
  versions: CharacterVersion[]
  builds: Build[]
} {
  const characters = new Map<string, Character>()
  const versions = new Map<string, CharacterVersion>()
  const builds: Build[] = []

  records.forEach((record) => {
    if (!characters.has(record.characterId)) characters.set(record.characterId, {
      id: record.characterId,
      name: record.name.replace(/(?:\s+copy(?:\s+\d+)?)+$/i, ''),
      aliases: [],
      series: record.series,
      image: record.image,
      description: record.description,
      tags: [...new Set([...record.archetype, ...record.combatTags, ...record.customTags])],
    })
    if (!versions.has(record.versionId)) versions.set(record.versionId, {
      id: record.versionId,
      characterId: record.characterId,
      versionName: record.version,
      arc: record.version,
      chapterRange: '',
      notes: record.notes,
    })
    builds.push({
      id: record.id,
      characterVersionId: record.versionId,
      buildName: record.buildName,
      gameUpdate: record.gameUpdate,
      bloodlines: record.bloodlines,
      elements: record.elements,
      cMode: record.cMode,
      zMode: record.zMode,
      combatArt: record.combatArt,
      weapon: record.weapon,
      hotbar: record.hotbar,
      combos: record.combos,
      ratings: record.ratings,
      alternatives: record.variations,
      sourceNotes: record.notes,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  })
  return { characters: [...characters.values()], versions: [...versions.values()], builds }
}
