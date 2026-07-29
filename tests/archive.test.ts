import { beforeEach, describe, expect, it, vi } from 'vitest'
import { curatedBuilds } from '../src/data/curatedBuilds'
import { createDuplicateName, createPermanentId } from '../src/lib/identity'
import { decodeTierShare, encodeTierShare } from '../src/lib/tierShare'
import { validateOfficialMoveNames } from '../src/lib/validation'
import { formatSuggestion } from '../src/repositories/SuggestionRepository'
import { buildRepository } from '../src/repositories/BuildRepository'
import { migratePublicData, PUBLIC_SCHEMA_VERSION } from '../src/services/publicMigration'

describe('reviewed public archive', () => {
  it('contains only the ten priority characters', () => expect(curatedBuilds).toHaveLength(10))
  it('uses stable unique IDs', () => expect(new Set(curatedBuilds.map((build) => build.id)).size).toBe(curatedBuilds.length))
  it('does not expose known generated move placeholders', () => {
    const abilities = curatedBuilds.flatMap((build) => build.variants.flatMap((variant) => variant.hotbar.map((slot) => slot.ability)))
    expect(validateOfficialMoveNames(abilities)).toEqual([])
  })
  it('publishes complete prepared variants only', () => {
    for (const build of curatedBuilds) for (const variant of build.variants) {
      expect(variant.bloodlines).toHaveLength(variant.bloodlineSlotCount)
      expect(variant.elements).toHaveLength(variant.elementSlotCount)
      expect(variant.hotbar.map((slot) => slot.key)).toEqual(['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q'])
      expect(variant.combos.length).toBeGreaterThan(0)
    }
  })
  it('authors James Lee two, three, four and four-element variants independently', () => {
    const james = curatedBuilds.find((build) => build.id === 'james-lee')!
    expect(james.variants.map((variant) => `${variant.bloodlineSlotCount}x${variant.elementSlotCount}`)).toEqual(expect.arrayContaining(['2x2', '3x2', '4x2', '4x4']))
    expect(new Set(james.variants.map((variant) => variant.hotbar.map((slot) => slot.ability).join('|'))).size).toBe(james.variants.length)
    expect(james.variants[0].bloodlines.map((slot) => slot.name)).toEqual(['Dio-Senko-Rose', 'Bruce-Kenichi', 'Pika-Senko', 'Doku-Tengoku'])
  })
  it('does not mark untested reviewed builds Verified', () => expect(curatedBuilds.some((build) => build.confidence === 'Verified')).toBe(false))
  it('uses the repository abstraction', async () => {
    const previews = await buildRepository.listBuildPreviews()
    expect(previews).toHaveLength(10)
    expect(await buildRepository.getBuild(previews[0].id)).toHaveProperty('variants')
  })
})

describe('personal tier sharing', () => {
  const payload = { title: 'My list', description: 'Personal', rows: [{ id: 's', label: 'S' }], assignments: { 'james-lee': 's' } }
  it('round trips a versioned static payload', () => expect(decodeTierShare(encodeTierShare(payload))).toMatchObject(payload))
  it('contains IDs and placements but no premium build data', () => {
    const encoded = encodeTierShare(payload)
    expect(encoded).not.toContain('Dio-Senko')
    expect(JSON.stringify(decodeTierShare(encoded))).not.toContain('hotbar')
  })
})

describe('suggestions and migration', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) })
  })
  it('formats a copyable suggestion without pretending to submit it', () => {
    expect(formatSuggestion({ characterName: 'Test', series: 'Series', version: '', reason: 'Reason', bloodlines: '', elements: '', mode: '', combatArt: '', notes: '', discord: '' })).toContain('Character: Test')
  })
  it('backs up custom builds before removing the old public archive', () => {
    localStorage.setItem('shindo-build-archive:v1', JSON.stringify([{ id: 'custom-1', status: 'Draft' }]))
    expect(migratePublicData().customBuildCount).toBe(1)
    expect(localStorage.getItem('shindo-build-archive:removed-custom-backup:v3')).toContain('custom-1')
    expect(localStorage.getItem('shindo-build-archive:public-schema-version')).toBe(String(PUBLIC_SCHEMA_VERSION))
  })
})

describe('legacy safety helpers', () => {
  it('normalizes generated copy suffixes', () => expect(createDuplicateName('Sung Jinwoo Copy Copy Copy', ['Sung Jinwoo', 'Sung Jinwoo Copy'])).toBe('Sung Jinwoo Copy 2'))
  it('creates unique IDs', () => expect(new Set(Array.from({ length: 500 }, () => createPermanentId())).size).toBe(500))
  it('filters and sorts 500 previews in under 100ms', () => {
    const records = Array.from({ length: 500 }, (_, index) => ({ id: `${index}`, name: `Fighter ${index}`, score: index % 10 }))
    const started = performance.now()
    records.filter((item) => item.name.includes('4')).sort((a, b) => b.score - a.score)
    expect(performance.now() - started).toBeLessThan(100)
  })
})
