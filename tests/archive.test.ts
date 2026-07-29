import { describe, expect, it, vi } from 'vitest'
import { createBlankBuild, originalCharacters } from '../src/data/characters'
import { createDuplicateName, createPermanentId } from '../src/lib/identity'
import { buildSchema } from '../src/lib/validation'
import { importArchive, exportArchive } from '../src/services/archiveIO'
import { databaseDiagnostics, repairBuildDatabase } from '../src/services/migration'
import { readStorage, writeStorage } from '../src/services/storage'
import { buildsByOwnership, paginateBuilds, searchBuilds, sortBuilds } from '../src/lib/archiveQuery'
import { reorderHotbar, validateBuildLab } from '../src/lib/buildLab'
import { toNormalizedArchive } from '../src/data/archiveModel'

describe('safe duplication', () => {
  it('numbers copies from the canonical base name', () => {
    const names = ['Sung Jinwoo', 'Sung Jinwoo Copy', 'Sung Jinwoo Copy 2']
    expect(createDuplicateName('Sung Jinwoo', names)).toBe('Sung Jinwoo Copy 3')
    expect(createDuplicateName('Sung Jinwoo Copy Copy Copy', names)).toBe('Sung Jinwoo Copy 3')
  })

  it('generates unique permanent IDs', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => createPermanentId()))
    expect(ids.size).toBe(1000)
  })

  it('does not mutate the original build while cloning', () => {
    const original = createBlankBuild()
    const copy = structuredClone(original)
    copy.name = createDuplicateName(original.name, [original.name])
    copy.bloodlines[0].name = 'Changed'
    expect(original.name).toBe('Untitled Fighter')
    expect(original.bloodlines[0].name).not.toBe('Changed')
  })
})

describe('database repair', () => {
  it('repairs duplicate IDs and repeated copy suffixes', () => {
    const first = structuredClone(originalCharacters[12])
    const second = structuredClone(first)
    second.name = 'Sung Jinwoo Copy Copy Copy'
    second.version = 'Alternate Arc'
    const repaired = repairBuildDatabase([first, second])
    const local = repaired.filter((build) => build.name.startsWith('Sung Jinwoo'))
    expect(new Set(local.map((build) => build.id)).size).toBe(local.length)
    expect(local.some((build) => /Copy Copy/i.test(build.name))).toBe(false)
  })

  it('removes exact duplicates but preserves distinct arc versions', () => {
    const first = structuredClone(originalCharacters[0])
    const distinct = structuredClone(first)
    distinct.id = 'james-distinct'
    distinct.version = 'First Generation'
    const repaired = repairBuildDatabase([first, structuredClone(first), distinct])
    expect(repaired.filter((build) => build.name === 'James Lee').length).toBe(2)
  })

  it('reports stable unique keys after repair', () => {
    const diagnostics = databaseDiagnostics(repairBuildDatabase(originalCharacters))
    expect(diagnostics.duplicateIdCount).toBe(0)
    expect(diagnostics.uniqueIdCount).toBe(diagnostics.characterCount)
  })
})

describe('validation, import and scale', () => {
  it('validates production starter builds', () => {
    expect(originalCharacters.every((build) => buildSchema.safeParse(build).success)).toBe(true)
  })

  it('exports and validates imports without crashing on damage', () => {
    const exported = exportArchive(originalCharacters.slice(0, 2))
    expect(importArchive(exported).builds.length).toBeGreaterThanOrEqual(2)
    expect(importArchive('not json').errors[0]).toContain('not valid JSON')
  })

  it('filters and sorts 500 generated builds under 100ms', () => {
    const dataset = Array.from({ length: 500 }, (_, index) => ({
      ...structuredClone(originalCharacters[index % originalCharacters.length]),
      id: `performance-${index}`,
      name: `Performance Fighter ${index}`,
    }))
    const start = performance.now()
    const result = dataset.filter((build) => build.name.includes('4')).sort((a, b) => b.ratings.pvp - a.ratings.pvp)
    expect(performance.now() - start).toBeLessThan(100)
    expect(result.length).toBeGreaterThan(0)
  })

  it('survives unavailable storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
    })
    expect(readStorage('x', [])).toEqual([])
    expect(writeStorage('x', [])).toBe(false)
    vi.unstubAllGlobals()
  })

  it('searches names, series and Bloodlines', () => {
    expect(searchBuilds(originalCharacters, 'Sung Jinwoo').some((build) => build.name === 'Sung Jinwoo')).toBe(true)
    expect(searchBuilds(originalCharacters, 'Doom-Shado').length).toBeGreaterThan(0)
  })

  it('filters by owned Bloodlines and missing-one readiness', () => {
    const build = originalCharacters[0]
    const owned = new Set(build.bloodlines.slice(0, 3).map((slot) => slot.name))
    expect(buildsByOwnership([build], owned, 0)).toHaveLength(0)
    expect(buildsByOwnership([build], owned, 1)).toHaveLength(1)
  })

  it('sorts without mutating input', () => {
    const input = originalCharacters.slice(0, 5)
    const before = input.map((build) => build.id)
    expect(sortBuilds(input, 'pvp', 'desc')[0].ratings.pvp).toBeGreaterThanOrEqual(sortBuilds(input, 'pvp', 'desc')[1].ratings.pvp)
    expect(input.map((build) => build.id)).toEqual(before)
  })

  it('paginates at requested boundaries', () => {
    expect(paginateBuilds(originalCharacters, 1, 12)).toHaveLength(12)
    expect(paginateBuilds(originalCharacters, 2, 12)[0].id).toBe(originalCharacters[12].id)
  })

  it('finds Build Lab validation conflicts', () => {
    const build = structuredClone(originalCharacters[0])
    build.bloodlines[1].name = build.bloodlines[0].name
    build.hotbar[1].key = build.hotbar[0].key
    expect(validateBuildLab(build)).toEqual(expect.arrayContaining(['Duplicate Bloodline selected.', 'Hotbar key conflict.']))
  })

  it('reorders hotbar immutably', () => {
    const hotbar = originalCharacters[0].hotbar
    const reordered = reorderHotbar(hotbar, 0, 2)
    expect(reordered[2].key).toBe(hotbar[0].key)
    expect(hotbar[0].key).toBe('1')
  })

  it('separates characters, versions and builds', () => {
    const first = structuredClone(originalCharacters[0])
    const variant = structuredClone(first)
    variant.id = 'james-variant'
    variant.versionId = 'version-james-first-generation'
    variant.version = 'First Generation'
    const archive = toNormalizedArchive([first, variant])
    expect(archive.characters).toHaveLength(1)
    expect(archive.versions).toHaveLength(2)
    expect(archive.builds).toHaveLength(2)
  })

  it('marks missing portraits without broken remote paths', () => {
    const missing = originalCharacters.find((build) => build.id === 'karsia')
    expect(missing?.image).toBe('')
  })
})
