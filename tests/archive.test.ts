import { existsSync, readFileSync } from 'node:fs'
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
import { defaultArchivePrefs, mergeArchivePrefs } from '../src/hooks/useArchivePrefs'
import { auditVariant, findBloodlineFamilyDuplicates } from '../src/lib/buildQuality'
import { resolveShindoAsset, shindoAssetManifest } from '../src/data/shindoAssetManifest'

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
      expect(build.variants.map((variant) => variant.elementSlotCount)).toEqual([2, 2, 2, 2])
      expect(build.variants.every((variant) => variant.bloodlineSlotCount >= 2 && variant.bloodlineSlotCount <= 4)).toBe(true)
      for (const variant of build.variants) {
        expect(variant.verificationStatus).toBe('Needs Retesting')
        expect(variant.hotbar.map((slot) => slot.key)).toEqual(['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q'])
        expect(variant.combos.length).toBeGreaterThanOrEqual(2)
        expect(variant.ownershipRequirements?.length).toBeGreaterThan(4)
        expect(variant.compromises?.length).toBeGreaterThan(0)
      }
      expect(build.variants[0].hotbar).not.toBe(build.variants[1].hotbar)
      expect(build.variants[1].hotbar).not.toBe(build.variants[2].hotbar)
      expect(new Set(build.variants.map((variant) => variant.id)).size).toBe(4)
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
  it('preserves inventory, favorites, and tier-list storage during migration', () => {
    const inventory = JSON.stringify({ statuses: { Akuma: 'Owned' }, elementStatuses: { Fire: 'Owned' } })
    const preferences = JSON.stringify({ favorites: ['james-lee'], theme: 'chakra-blue' })
    const tiers = JSON.stringify([{ id: 'personal-tier', assignments: { 'james-lee': 's' } }])
    localStorage.setItem('shindo-build-archive:bloodlines:v1', inventory)
    localStorage.setItem('shindo-build-archive:prefs:v1', preferences)
    localStorage.setItem('shindo-build-archive:tier-lists:v2', tiers)
    migratePublicData()
    expect(localStorage.getItem('shindo-build-archive:bloodlines:v1')).toBe(inventory)
    expect(localStorage.getItem('shindo-build-archive:prefs:v1')).toBe(preferences)
    expect(localStorage.getItem('shindo-build-archive:tier-lists:v2')).toBe(tiers)
  })
  it('normalizes copy suffixes and creates unique IDs', () => {
    expect(createDuplicateName('Sung Jinwoo Copy Copy Copy', ['Sung Jinwoo', 'Sung Jinwoo Copy'])).toBe('Sung Jinwoo Copy 2')
    expect(new Set(Array.from({ length: 500 }, () => createPermanentId())).size).toBe(500)
  })
})

describe('Shindo identity, assets, and build-quality checks', () => {
  it('defaults to Shindo Green and preserves an existing theme preference', () => {
    expect(defaultArchivePrefs.theme).toBe('shindo-green')
    expect(mergeArchivePrefs({ theme: 'chakra-blue', favorites: ['james-lee'] })).toMatchObject({ theme: 'chakra-blue', favorites: ['james-lee'] })
  })
  it('defines all three themes through shared CSS variables', () => {
    const css = readFileSync(resolve('src/index.css'), 'utf8')
    expect(css).toContain('[data-theme="shindo-green"]')
    expect(css).toContain('[data-theme="chakra-blue"]')
    expect(css).toContain('[data-theme="ember-crimson"]')
    expect(css).toContain('--accent: #72d64b')
  })
  it('has a unique, locally cached direct-asset manifest', () => {
    expect(new Set(shindoAssetManifest.map((entry) => entry.id)).size).toBe(shindoAssetManifest.length)
    const available = shindoAssetManifest.filter((entry) => entry.status === 'Available')
    expect(available.length).toBeGreaterThan(75)
    expect(available.every((entry) => entry.localPath.startsWith('/shindo-icons/'))).toBe(true)
    expect(available.every((entry) => existsSync(resolve('public', entry.localPath.slice(1))))).toBe(true)
    expect(available.every((entry) => !entry.localPath.startsWith('http'))).toBe(true)
  })
  it.each([
    ['Dio-Senko-Rose', 'Bloodline'],
    ['Gale', 'Element'],
    ['Kor Tailed Spirit Generation 2', 'Mode'],
  ] as const)('resolves the %s %s icon', (name, type) => {
    const asset = resolveShindoAsset(name, type)
    expect(asset?.status).not.toBe('Missing')
    expect(asset?.localPath).toMatch(/^\/shindo-icons\//)
  })
  it('keeps missing assets as missing instead of assigning an unrelated icon', () => {
    const asset = resolveShindoAsset('Definitely Not A Shindo Item', 'Bloodline')
    expect(asset).toBeUndefined()
  })
  it('maps aliases without duplicate asset IDs', () => {
    expect(resolveShindoAsset('Dio Senko Rose', 'Bloodline')?.id).toBe(resolveShindoAsset('Dio-Senko-Rose', 'Bloodline')?.id)
  })
  it('uses direct icons in cards, details, inventory, and the hotbar', () => {
    for (const file of ['CharacterCard.tsx', 'FullBuildPage.tsx', 'ArchiveWorkshop.tsx']) {
      expect(readFileSync(resolve('src/components', file), 'utf8')).toContain('ShindoIcon')
    }
  })
  it('resolves prepared Kenjutsu icons locally', () => {
    for (const name of ['Wind-Kenjutsu', 'Shiver-Kenjutsu', 'Thunder-Kenjutsu', 'Moon-Kenjutsu']) {
      const asset = resolveShindoAsset(name, 'Kenjutsu')
      expect(asset?.status).toBe('Available')
      expect(existsSync(resolve('public', asset!.localPath.slice(1)))).toBe(true)
    }
  })
  it('gives all 20 reviewed builds prepared slot and accessible profiles', () => {
    const reviewed = completeRoster.filter((build) => build.publicationStatus === 'Reviewed')
    expect(reviewed).toHaveLength(20)
    for (const build of reviewed) {
      expect([2, 3, 4].every((count) => build.variants.some((variant) => variant.bloodlineSlotCount === count))).toBe(true)
      expect(build.variants.some((variant) => variant.type === 'Beginner' || /accessible/i.test(variant.name))).toBe(true)
      for (const variant of build.variants) {
        expect(variant.combatArtReason).toBeTruthy()
        expect(variant.kenjutsu).toBeTruthy()
        expect(variant.kenjutsuReason).toBeTruthy()
        expect(variant.weaponReason).toBeTruthy()
        expect(variant.qAction?.name).toBeTruthy()
        expect(variant.equipment?.ninjaToolReason).toBeTruthy()
        expect(variant.hotbar).toHaveLength(12)
      }
    }
  })
  it('materializes reviewed editorial data without the old primary factory', () => {
    expect(readFileSync(resolve('src/data/curatedBuilds.ts'), 'utf8')).not.toContain('primaryVariant')
    expect(readFileSync(resolve('src/data/animeMangaBuilds.ts'), 'utf8')).not.toContain('authoredVariant')
    expect(readFileSync(resolve('src/data/reviewedBuilds.ts'), 'utf8')).not.toMatch(/\barray\.slice\b|primaryVariant|authoredVariant/)
  })
  it('models Goo Kim as a visible weapon-first setup', () => {
    const goo = curatedBuilds.find((build) => build.id === 'goo-kim')!
    const primary = goo.variants.find((variant) => variant.type === 'Primary')!
    expect(primary.kenjutsu).toBe('Wind-Kenjutsu')
    expect(primary.weapon).toBe('Bankai Blade')
    expect(primary.qAction).toMatchObject({ source: 'Weapon', name: 'Bankai Blade Q ability' })
    expect(goo.variants.map((variant) => variant.name)).toEqual(expect.arrayContaining(['Three-Slot Weapon Genius', 'Two-Slot Weapon Genius', 'Accessible Sword Build', 'Competitive Sword Build']))
  })
  it('ships a routed full build page and compact quick view', () => {
    const app = readFileSync(resolve('src/App.tsx'), 'utf8')
    expect(app).toContain('/build/')
    expect(app).toContain('BuildQuickView')
    expect(app).toContain('FullBuildPage')
    expect(readFileSync(resolve('src/components/FullBuildPage.tsx'), 'utf8')).toContain('Compare current variant with')
  })
  it('removes the audited SnakeMan recolor overlap', () => {
    const luffy = animeMangaBuilds.find((build) => build.id === 'anime-monkey-d-luffy-snakeman')!
    expect(findBloodlineFamilyDuplicates(luffy.variants.find((variant) => variant.type === 'Primary')!)).toEqual([])
    expect(luffy.variants.flatMap((variant) => variant.bloodlines.map((slot) => slot.name))).not.toContain('SnakeMan-Platinum')
  })
  it('detects filler equipment and simultaneous C/Z recommendations', () => {
    const naruto = animeMangaBuilds.find((build) => build.id === 'anime-naruto-uzumaki')!
    const variant = structuredClone(naruto.variants.find((item) => item.type === 'Primary')!)
    variant.consumable = 'Chi Pot'
    const codes = auditVariant(variant).map((issue) => issue.code)
    expect(codes).toContain('filler-consumable')
    expect(codes).toContain('mode-compatibility')
  })
  it('rejects duplicate hotbar moves and unequipped sources', () => {
    const base = structuredClone(curatedBuilds[0].variants[0])
    base.hotbar[1].ability = base.hotbar[0].ability
    base.hotbar[1].source = 'Unequipped-Fake'
    const codes = auditVariant(base).map((issue) => issue.code)
    expect(codes).toContain('duplicate-hotbar-move')
    expect(codes).toContain('unequipped-hotbar-source')
  })
  it('allows an intentionally empty control', () => {
    const base = structuredClone(curatedBuilds[0].variants[0])
    base.hotbar[10] = { ...base.hotbar[10], source: 'None', ability: 'Not used in this variant' }
    expect(auditVariant(base).filter((issue) => issue.code === 'unequipped-hotbar-source' && issue.message.includes('Not used'))).toHaveLength(0)
  })
  it('keeps James Lee core unchanged and public authoring absent', () => {
    expect(curatedBuilds[0].variants[0].bloodlines.map((slot) => slot.name)).toEqual(['Dio-Senko-Rose', 'Bruce-Kenichi', 'Pika-Senko', 'Doku-Tengoku'])
    const app = readFileSync(resolve('src/App.tsx'), 'utf8')
    expect(app).not.toMatch(/BuildEditor|Add Build|delete official|export official/i)
    expect(existsSync(resolve('README.md'))).toBe(false)
  })
})
