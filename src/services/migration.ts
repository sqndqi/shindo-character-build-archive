import { originalCharacters } from '../data/characters'
import { migrateBloodlineSlot } from '../data/buildMigration'
import { createDuplicateName, createPermanentId } from '../lib/identity'
import { buildSchema } from '../lib/validation'
import type { CharacterBuild } from '../types'
import { backupRawBuildData, STORAGE_KEYS, writeStorage } from './storage'

export const CURRENT_SCHEMA_VERSION = 3

const expectedKeys = new Set(['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q'])

export function normalizeBuild(build: CharacterBuild): CharacterBuild {
  const original = originalCharacters.find((item) => item.id === build.id)
  const now = new Date().toISOString()
  return {
    ...original,
    ...build,
    characterId: build.characterId ?? original?.characterId ?? `character-${(build.name || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    versionId: build.versionId ?? original?.versionId ?? `version-${build.id}`,
    buildName: build.buildName ?? original?.buildName ?? build.version ?? 'Canonical Build',
    franchise: build.franchise ?? original?.franchise ?? build.series,
    combatTags: build.combatTags ?? original?.combatTags ?? ['Martial arts'],
    customTags: build.customTags ?? [],
    effectsIntensity: build.effectsIntensity ?? original?.effectsIntensity ?? 'Medium',
    createdAt: build.createdAt ?? now,
    updatedAt: build.updatedAt ?? now,
    gameUpdate: build.gameUpdate ?? 'Unverified',
    lastVerifiedUpdate: build.lastVerifiedUpdate ?? '',
    verificationStatus: build.verificationStatus ?? 'Needs Retesting',
    testing: build.testing ?? { status: 'Untested', contexts: [], tester: '', testDate: '', notes: '' },
    changeHistory: build.changeHistory ?? [],
    bloodlines: (build.bloodlines ?? []).map((slot, index) => ({ ...slot, id: slot.id ?? `${build.id}-bloodline-${index + 1}` })),
    hotbar: (build.hotbar ?? []).map((slot, index) => ({ ...slot, id: slot.id ?? `${build.id}-hotbar-${slot.key || index + 1}` })),
    variants: (build.variants ?? []).map((variant) => ({
      ...variant,
      bloodlines: (variant.bloodlines ?? []).map((slot) => migrateBloodlineSlot(slot as unknown as Record<string, unknown>)),
      combatArtReason: variant.combatArtReason ?? 'Migrated legacy selection; editorial reason is still being reviewed.',
      kenjutsu: variant.kenjutsu ?? 'None',
      kenjutsuReason: variant.kenjutsuReason ?? 'No Kenjutsu was recorded in the legacy variant.',
      weaponReason: variant.weaponReason ?? (variant.weapon === 'None' ? 'No weapon was recorded.' : 'Migrated legacy weapon; editorial reason is still being reviewed.'),
      qAction: variant.qAction ?? (variant.weapon !== 'None'
        ? { source: 'Weapon', name: `${variant.weapon} Q action`, purpose: 'Migrated weapon action; exact behavior still needs review.' }
        : variant.combatArt !== 'None'
          ? { source: 'Combat Art', name: `${variant.combatArt} Q action`, purpose: 'Migrated Combat Art action.' }
          : { source: 'None', name: 'Not used in this variant', purpose: 'No meaningful Q action was recorded.' }),
      fightingStyleNotes: variant.fightingStyleNotes ?? [],
      equipment: variant.equipment ?? {
        ninjaTool: variant.ninjaTool,
        ninjaToolReason: 'Migrated legacy selection; reason still needs review.',
        consumable: variant.consumable,
        consumableReason: 'Migrated legacy selection; reason still needs review.',
        mentor: variant.mentor,
        mentorReason: 'Migrated legacy selection; reason still needs review.',
        race: variant.race,
        raceReason: 'Migrated legacy selection; reason still needs review.',
      },
    })),
    ratings: {
      ...(original?.ratings ?? {}),
      ...build.ratings,
      aura: build.ratings?.aura ?? original?.ratings.aura ?? 8,
    },
  } as CharacterBuild
}

export function repairBuildDatabase(input: CharacterBuild[]): CharacterBuild[] {
  const repaired: CharacterBuild[] = []
  const usedIds = new Set<string>()
  const names: string[] = input.map((item) => item?.name ?? '')
  const exactRecords = new Set<string>()

  input.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') return
    const exact = JSON.stringify(raw)
    if (exactRecords.has(exact)) return
    exactRecords.add(exact)

    const build = normalizeBuild(structuredClone(raw))
    if (!build.id || usedIds.has(build.id)) build.id = createPermanentId('repaired')
    usedIds.add(build.id)

    if (/(?:\s+copy(?:\s+\d+)?){2,}\s*$/i.test(build.name)) {
      build.name = createDuplicateName(build.name, [...names.slice(0, index), ...repaired.map((item) => item.name)])
    }
    repaired.push(build)
  })

  const localIds = new Set(repaired.map((build) => build.id))
  repaired.push(...structuredClone(originalCharacters.filter((build) => !localIds.has(build.id))))
  return repaired
}

export function migrateStoredBuilds(): CharacterBuild[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.builds)
    if (!raw) return structuredClone(originalCharacters)
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return structuredClone(originalCharacters)

    const version = Number(localStorage.getItem(STORAGE_KEYS.migration) ?? 0)
    const builds = version >= CURRENT_SCHEMA_VERSION
      ? parsed.map(normalizeBuild)
      : repairBuildDatabase(parsed)

    if (version < CURRENT_SCHEMA_VERSION) {
      backupRawBuildData(raw, CURRENT_SCHEMA_VERSION)
      writeStorage(STORAGE_KEYS.builds, builds)
      localStorage.setItem(STORAGE_KEYS.migration, String(CURRENT_SCHEMA_VERSION))
    }
    return builds
  } catch {
    return structuredClone(originalCharacters)
  }
}

export function databaseDiagnostics(builds: CharacterBuild[]) {
  const ids = new Set<string>()
  const duplicateIds = new Set<string>()
  const names = new Map<string, number>()
  let invalidBloodlines = 0
  let invalidHotbarEntries = 0
  let corruptedRecords = 0

  builds.forEach((build) => {
    if (ids.has(build.id)) duplicateIds.add(build.id)
    ids.add(build.id)
    names.set(build.name, (names.get(build.name) ?? 0) + 1)
    invalidBloodlines += build.bloodlines.filter((slot) => !slot.name || !slot.purpose).length
    invalidHotbarEntries += build.hotbar.filter((slot) => !expectedKeys.has(slot.key) || !slot.ability || !slot.source).length
    if (!buildSchema.safeParse(build).success) corruptedRecords += 1
  })

  return {
    characterCount: builds.length,
    uniqueIdCount: ids.size,
    duplicateIdCount: duplicateIds.size,
    duplicateNames: [...names.entries()].filter(([, count]) => count > 1),
    missingImages: builds.filter((build) => !build.image).map((build) => build.name),
    invalidBloodlines,
    invalidHotbarEntries,
    corruptedRecords,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  }
}
