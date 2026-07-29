import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { completeRoster, restoredDraftBuilds } from '../src/data/restoredRoster'
import { curatedBuilds } from '../src/data/curatedBuilds'
import { animeMangaBuilds } from '../src/data/animeMangaBuilds'
import { createDuplicateName, createPermanentId } from '../src/lib/identity'
import { decodeTierShare, encodeTierShare } from '../src/lib/tierShare'
import { validateOfficialMoveNames } from '../src/lib/validation'
import { comparePublicationStatus } from '../src/lib/publication'
import { formatSuggestion } from '../src/repositories/SuggestionRepository'
import { buildRepository } from '../src/repositories/BuildRepository'
import { migratePublicData, PUBLIC_SCHEMA_VERSION } from '../src/services/publicMigration'

describe('full restored roster', () => {
  it('contains exactly 100 characters after preserving the original 90', () => {
    const originalIds = [...curatedBuilds, ...restoredDraftBuilds].map((build) => build.id)
    expect(completeRoster).toHaveLength(100)
    expect(originalIds).toHaveLength(90)
    expect(originalIds.every((id) => completeRoster.some((build) => build.id === id))).toBe(true)
  })
  it('adds the ten expected anime and manga records', () => {
    expect(animeMangaBuilds.map((build) => build.id)).toEqual([
      'anime-naruto-uzumaki', 'anime-sasuke-uchiha', 'anime-madara-uchiha', 'anime-minato-namikaze', 'anime-itachi-uchiha',
      'anime-boruto-uzumaki', 'anime-ichigo-kurosaki', 'anime-sosuke-aizen', 'anime-monkey-d-luffy-snakeman', 'anime-jotaro-kujo',
    ])
  })
  it.each(['Solo Leveling', 'The God of High School', 'Eleceed', 'Nano Machine', 'Weak Hero', 'The Beginning After the End'])('includes %s', (series) => expect(completeRoster.some((build) => build.series === series)).toBe(true))
  it('includes multiple Murim properties', () => expect(completeRoster.filter((build) => /Murim|Northern Blade|Mount Hua|Gosu/.test(`${build.series} ${build.franchise}`)).length).toBeGreaterThan(3))
  it('contains multiple non-Lookism series', () => expect(new Set(completeRoster.filter((build) => build.series !== 'Lookism').map((build) => build.series)).size).toBeGreaterThan(20))
  it('has no duplicate build IDs', () => expect(new Set(completeRoster.map((build) => build.id)).size).toBe(completeRoster.length))
  it('has no corrupted repeated Copy names', () => expect(completeRoster.some((build) => /Copy(?:\s+Copy)+/i.test(build.name))).toBe(false))
  it('keeps drafts and research records publicly available', () => {
    expect(restoredDraftBuilds.length).toBe(80)
    expect(restoredDraftBuilds.every((build) => ['Draft', 'Needs Research', 'Needs Retesting'].includes(build.publicationStatus))).toBe(true)
  })
  it('orders reviewed builds before restored drafts', () => {
    const sorted = [...completeRoster].sort(comparePublicationStatus)
    const ranks = sorted.map((build) => build.publicationStatus)
    expect(ranks.slice(0, 20).every((status) => status === 'Reviewed')).toBe(true)
    expect(ranks.lastIndexOf('Needs Retesting')).toBeLessThan(ranks.indexOf('Draft'))
    expect(ranks.lastIndexOf('Draft')).toBeLessThan(ranks.indexOf('Needs Research'))
  })
  it('keeps curated Lookism before the anime wave in roster composition', () => {
    expect(completeRoster.slice(0, 10).map((build) => build.id)).toEqual(curatedBuilds.map((build) => build.id))
    expect(completeRoster.slice(10, 20).map((build) => build.id)).toEqual(animeMangaBuilds.map((build) => build.id))
  })
  it('has the audited publication counts', () => {
    const count = (status: string) => completeRoster.filter((build) => build.publicationStatus === status).length
    expect({ reviewed: count('Reviewed'), retesting: count('Needs Retesting'), draft: count('Draft'), research: count('Needs Research') }).toEqual({ reviewed: 20, retesting: 63, draft: 9, research: 8 })
  })
  it('preserves the curated James Lee authority and approved core', () => {
    const james = completeRoster.find((build) => build.id === 'james-lee')!
    expect(james).toBe(curatedBuilds[0])
    expect(james.variants[0].bloodlines.map((slot) => slot.name)).toEqual(['Dio-Senko-Rose', 'Bruce-Kenichi', 'Pika-Senko', 'Doku-Tengoku'])
    expect(james.variants).toHaveLength(4)
  })
  it('keeps every portrait local or uses the fallback', () => {
    for (const build of completeRoster) {
      if (!build.image) {
        expect(build.thumbnail || '').toBe('')
      } else {
        expect(build.image.startsWith('/characters/')).toBe(true)
        expect(existsSync(resolve('public', build.image.replace(/^\//, '')))).toBe(true)
        expect(existsSync(resolve('public', (build.thumbnail ?? '').replace(/^\//, '')))).toBe(true)
      }
    }
  })
  it('converts generated draft moves into unresolved research slots', () => {
    const abilities = restoredDraftBuilds.flatMap((build) => build.variants[0].hotbar.map((slot) => slot.ability))
    expect(new Set(abilities)).toEqual(new Set(['Unresolved — research required']))
    expect(validateOfficialMoveNames(abilities)).toEqual([])
  })
  it('retains complete independently authored curated variants', () => {
    for (const build of curatedBuilds) for (const variant of build.variants) {
      expect(variant.bloodlines).toHaveLength(variant.bloodlineSlotCount)
      expect(variant.elements).toHaveLength(variant.elementSlotCount)
      expect(variant.hotbar).toHaveLength(12)
    }
  })
  it('keeps all ten existing curated Lookism object references unchanged', () => {
    expect(completeRoster.slice(0, curatedBuilds.length)).toEqual(curatedBuilds)
  })
  it('authors complete independent two, three, and four-slot anime variants', () => {
    for (const build of animeMangaBuilds) {
      expect(build.publicationStatus).toBe('Reviewed')
      expect(build.confidence).toBe('Strong Match')
      expect(build.media).toBe('Manga / Anime')
      expect(build.variants.map((variant) => [variant.type, variant.bloodlineSlotCount, variant.elementSlotCount])).toEqual([
        ['Two Slot', 2, 2], ['Three Slot', 3, 2], ['Primary', 4, 2],
      ])
      for (const variant of build.variants) {
        expect(variant.verificationStatus).toBe('Needs Retesting')
        expect(variant.hotbar.map((slot) => slot.key)).toEqual(['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q'])
        expect(variant.combos).toHaveLength(6)
        expect(variant.ownershipRequirements?.length).toBeGreaterThan(4)
        expect(variant.compromises?.length).toBeGreaterThan(0)
      }
      expect(build.variants[0].hotbar).not.toBe(build.variants[1].hotbar)
      expect(build.variants[1].hotbar).not.toBe(build.variants[2].hotbar)
      expect(build.variants[0].bloodlines.map((slot) => slot.name)).not.toEqual(build.variants[2].bloodlines.map((slot) => slot.name))
    }
  })
  it('uses checked or explicitly unresolved anime move labels without placeholders', () => {
    const abilities = animeMangaBuilds.flatMap((build) => build.variants.flatMap((variant) => variant.hotbar.map((slot) => slot.ability)))
    expect(validateOfficialMoveNames(abilities)).toEqual([])
    expect(abilities.every((ability) => ability.trim().length > 0)).toBe(true)
  })
  it('has unique build, character, version, variant, and hotbar IDs', () => {
    const unique = (values: string[]) => new Set(values).size === values.length
    expect(unique(completeRoster.map((build) => build.id))).toBe(true)
    expect(unique(animeMangaBuilds.map((build) => build.characterId))).toBe(true)
    expect(animeMangaBuilds.every((build) => ![...curatedBuilds, ...restoredDraftBuilds].some((existing) => existing.characterId === build.characterId))).toBe(true)
    expect(unique(completeRoster.map((build) => build.versionId))).toBe(true)
    expect(unique(completeRoster.flatMap((build) => build.variants.map((variant) => variant.id)))).toBe(true)
    expect(unique(animeMangaBuilds.flatMap((build) => build.variants.flatMap((variant) => variant.hotbar.map((slot) => slot.id))))).toBe(true)
  })
  it.each(['Naruto / Boruto', 'Bleach', 'One Piece', 'JoJo’s Bizarre Adventure'])('supports the %s franchise filter value', (franchise) => {
    expect(animeMangaBuilds.some((build) => build.franchise === franchise)).toBe(true)
  })
  it('supports the Anime / Manga media filter and inventory calculations', () => {
    const anime = completeRoster.filter((build) => build.media === 'Manga / Anime')
    const ownedNames = new Set(anime.flatMap((build) => build.variants.flatMap((variant) => variant.bloodlines.map((slot) => slot.name))))
    expect(anime).toHaveLength(10)
    expect(ownedNames.size).toBeGreaterThan(20)
    expect(ownedNames.has('Six-Paths-Narumaki')).toBe(true)
    expect(ownedNames.has('Getsuga-Black')).toBe(true)
    expect(ownedNames.has('SnakeMan')).toBe(true)
  })
  it('resolves every new portrait and thumbnail and keeps README absent', () => {
    for (const build of animeMangaBuilds) {
      expect(existsSync(resolve('public', build.image.replace(/^\//, '')))).toBe(true)
      expect(existsSync(resolve('public', build.thumbnail!.replace(/^\//, '')))).toBe(true)
    }
    expect(existsSync(resolve('README.md'))).toBe(false)
  })
})

describe('repository consumers and performance', () => {
  it('serves the complete roster to gallery, tier lists, and compare consumers', async () => {
    const previews = await buildRepository.listBuildPreviews()
    expect(previews).toHaveLength(completeRoster.length)
    expect(previews.some((build) => build.series === 'Solo Leveling')).toBe(true)
    expect(previews.filter((build) => build.media === 'Manga / Anime')).toHaveLength(10)
  })
  it('filters and sorts the restored roster quickly', () => {
    const dataset = Array.from({ length: 500 }, (_, index) => ({ ...completeRoster[index % completeRoster.length], id: `perf-${index}` }))
    const started = performance.now()
    dataset.filter((build) => /Solo|Lookism|Eleceed/.test(build.series)).sort((a, b) => b.ratings.pvp - a.ratings.pvp)
    expect(performance.now() - started).toBeLessThan(100)
  })
})

describe('personal tier sharing', () => {
  const payload = { title: 'My list', description: 'Personal', rows: [{ id: 's', label: 'S' }], assignments: { 'james-lee': 's', 'sung-jinwoo': 's' } }
  it('round trips IDs without premium build data', () => {
    const decoded = decodeTierShare(encodeTierShare(payload))
    expect(decoded).toMatchObject(payload)
    expect(JSON.stringify(decoded)).not.toContain('hotbar')
  })
})

describe('suggestions, migration and identity', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) })
  })
  it('formats suggestions without publishing them', () => expect(formatSuggestion({ characterName: 'Test', series: 'Series', version: '', reason: 'Reason', bloodlines: '', elements: '', mode: '', combatArt: '', notes: '', discord: '' })).toContain('Character: Test'))
  it('runs the silent v4 migration once without deleting local data', () => {
    const original = JSON.stringify([{ id: 'custom-1', status: 'Draft' }])
    localStorage.setItem('shindo-build-archive:v1', original)
    expect(migratePublicData()).toMatchObject({ migrated: true, customBuildCount: 1 })
    expect(localStorage.getItem('shindo-build-archive:v1')).toBe(original)
    expect(localStorage.getItem('shindo-build-archive:custom-build-backup:v4')).toContain('custom-1')
    expect(migratePublicData().migrated).toBe(false)
    expect(localStorage.getItem('shindo-build-archive:public-schema-version')).toBe(String(PUBLIC_SCHEMA_VERSION))
  })
  it('normalizes copy suffixes and creates unique IDs', () => {
    expect(createDuplicateName('Sung Jinwoo Copy Copy Copy', ['Sung Jinwoo', 'Sung Jinwoo Copy'])).toBe('Sung Jinwoo Copy 2')
    expect(new Set(Array.from({ length: 500 }, () => createPermanentId())).size).toBe(500)
  })
})
