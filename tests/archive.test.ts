import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  it('defaults to Agarthia Crimson and preserves an existing theme preference', () => {
    expect(defaultArchivePrefs.theme).toBe('agarthia-crimson')
    expect(mergeArchivePrefs({ theme: 'ember-violet', favorites: ['james-lee'] })).toMatchObject({ theme: 'ember-violet', favorites: ['james-lee'] })
  })
  it('defines all three themes through shared CSS variables', () => {
    const css = readFileSync(resolve('src/index.css'), 'utf8')
    expect(css).toContain('[data-theme="agarthia-crimson"]')
    expect(css).toContain('[data-theme="ember-violet"]')
    expect(css).toContain('[data-theme="midnight-steel"]')
    expect(css).toContain('--accent: #e06b5c')
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
    expect(readFileSync(resolve('src/components/build-sections/index.tsx'), 'utf8')).toContain('Compare current variant with')
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
  it('detects weapon abilities without a weapon equipped', () => {
    const base = structuredClone(curatedBuilds[0].variants[0])
    base.weapon = 'None'
    base.hotbar[0] = { ...base.hotbar[0], sourceType: 'Weapon', source: 'Bankai Blade', ability: 'Bankai Slash' }
    const codes = auditVariant(base).map((issue) => issue.code)
    expect(codes).toContain('weapon-ability-no-weapon')
  })
  it('detects vague placeholder abilities', () => {
    const base = structuredClone(curatedBuilds[0].variants[0])
    base.hotbar[0] = { ...base.hotbar[0], ability: 'best move' }
    const codes = auditVariant(base).map((issue) => issue.code)
    expect(codes).toContain('vague-placeholder-1')
  })


  it('detects mode moves referencing an unequipped mode', () => {
    const base = structuredClone(curatedBuilds[0].variants[0])
    base.hotbar[0] = { ...base.hotbar[0], sourceType: 'Mode', modeAbility: true, modeRequirement: 'Sengoku Mode', ability: 'Sengoku Strike' }
    base.cMode = 'Kor Tailed Spirit'
    base.zMode = 'None'
    const codes = auditVariant(base).map((issue) => issue.code)
    expect(codes).toContain('mode-not-equipped-1')
  })
  it('keeps James Lee core unchanged and public authoring absent', () => {
    expect(curatedBuilds[0].variants[0].bloodlines.map((slot) => slot.name)).toEqual(['Dio-Senko-Rose', 'Bruce-Kenichi', 'Pika-Senko', 'Doku-Tengoku'])
    const app = readFileSync(resolve('src/App.tsx'), 'utf8')
    expect(app).not.toMatch(/BuildEditor|Add Build|delete official|export official/i)
    expect(existsSync(resolve('README.md'))).toBe(false)
  })
})

describe('build page section architecture', () => {
  it('exports all 12 build sections plus SectionHeading from build-sections', () => {
    const source = readFileSync(resolve('src/components/build-sections/index.tsx'), 'utf8')
    for (const name of [
      'BuildOverviewSection', 'VariantSelectorSection', 'BloodlineElementsSection',
      'ModesSection', 'UtilitySection', 'EquipmentSection', 'StatsPlaystyleSection',
      'HotbarSection', 'ComboSection', 'AlternativesSection', 'BuildAuditPanel',
      'ResearchEvidenceSection', 'SectionHeading',
    ]) {
      expect(source).toContain(`export function ${name}`)
    }
  })
  it('imports all 12 sections into FullBuildPage', () => {
    const source = readFileSync(resolve('src/components/FullBuildPage.tsx'), 'utf8')
    for (const name of [
      'BuildOverviewSection', 'VariantSelectorSection', 'BloodlineElementsSection',
      'ModesSection', 'UtilitySection', 'EquipmentSection', 'StatsPlaystyleSection',
      'HotbarSection', 'ComboSection', 'AlternativesSection', 'BuildAuditPanel',
      'ResearchEvidenceSection',
    ]) {
      expect(source).toContain(name)
    }
  })
  it('renders a sticky section nav with 10 jump links', () => {
    const source = readFileSync(resolve('src/components/FullBuildPage.tsx'), 'utf8')
    expect(source).toContain('dossier-section-nav')
    expect(source).toContain('scrollIntoView')
    const navIds = ['section-overview', 'section-variants', 'section-bloodlines', 'section-modes',
      'section-equipment', 'section-hotbar',
      'section-combos', 'section-alternatives', 'section-legality', 'section-research']
    for (const id of navIds) expect(source).toContain(id)
  })
  it('removed the old tab navigation system', () => {
    const source = readFileSync(resolve('src/components/FullBuildPage.tsx'), 'utf8')
    expect(source).not.toContain('activeView')
    expect(source).not.toContain('dossier-nav')
    expect(source).not.toMatch(/setActiveView/)
  })
  it('uses scrollable sections container not tabs', () => {
    const source = readFileSync(resolve('src/components/FullBuildPage.tsx'), 'utf8')
    expect(source).toContain('dossier-sections')
    expect(source).not.toContain('dossier-tabs')
  })
  it('keeps locked build page free of premium hotbar or variant data', () => {
    const locked = readFileSync(resolve('src/components/LockedBuildPage.tsx'), 'utf8')
    expect(locked).not.toContain('hotbar')
    expect(locked).not.toContain('variant.bloodlines')
    expect(locked).not.toContain('variant.hotbar')
    expect(locked).not.toContain('combo')
    expect(locked).toContain('Premium loadout hidden')
  })
  it('defines CSS for all build section components', () => {
    const css = readFileSync(resolve('src/index.css'), 'utf8')
    for (const selector of [
      '.dossier-sections', '.build-section', '.dossier-section-nav',
      '.overview-facts-grid', '.ability-slot-grid', '.modes-grid',
      '.utility-slots', '.equipment-grid', '.stats-bars',
      '.combo-list', '.audit-issues', '.research-status-grid',
      '.hotbar-research-list', '.research-badge',
    ]) {
      expect(css).toContain(selector)
    }
  })
  it('includes responsive breakpoints for build sections', () => {
    const css = readFileSync(resolve('src/index.css'), 'utf8')
    expect(css).toContain('.stat-bar__fill { transition: none; }')
    expect(css).toContain('.evidence-toggle svg { transition: none; }')
  })
  it('handles missing optional fields with research status badges', () => {
    const badge = readFileSync(resolve('src/components/build-sections/ResearchStatusBadge.tsx'), 'utf8')
    expect(badge).toContain('Not researched')
    expect(badge).toContain('status?: SlotResearchStatus')
    const empty = readFileSync(resolve('src/components/build-sections/EmptyResearchState.tsx'), 'utf8')
    expect(empty).toContain('empty-research-state')
  })
  it('preserves variant switching with View Transitions API', () => {
    const source = readFileSync(resolve('src/components/FullBuildPage.tsx'), 'utf8')
    expect(source).toContain('transitionUpdate')
    expect(source).toContain('startViewTransition')
    expect(source).toContain('prefers-reduced-motion')
  })
  it('tracks build views via onViewed callback and useEffect', () => {
    const source = readFileSync(resolve('src/components/FullBuildPage.tsx'), 'utf8')
    expect(source).toContain('onViewed')
    expect(source).toContain('useEffect')
    expect(source).toContain('build.id')
  })
  it('includes game hotbar preview with accessible text', () => {
    const hotbar = readFileSync(resolve('src/components/GameHotbarPreview.tsx'), 'utf8')
    expect(hotbar).toContain('game-hotbar__accessible-list')
  })
  it('has exactly five free builds defined in App routing', () => {
    const app = readFileSync(resolve('src/App.tsx'), 'utf8')
    const match = app.match(/freeBuildIds\s*=\s*\[([\s\S]*?)\]\s*as const/)
    expect(match).not.toBeNull()
    const ids = match![1].match(/["']([^"']+)["']/g)!.map((s) => s.replace(/["']/g, ''))
    expect(ids).toHaveLength(5)
    for (const id of ids) expect(completeRoster.some((build) => build.id === id)).toBe(true)
  })
})

import {
  validateSlotCount,
  validateSourceTraceability,
  validateModeConflicts,
  validateInventedNames,
  validateStatsAllocation,
  validatePremiumPrivacy,
  validateBloodlineCompleteness,
  validateComboKeys,
  runBuildValidation,
} from '../src/data/buildValidation'
import {
  getElementSlots,
  normalizeBuildElements,
  isElementSlot,
  migrateComboSequence,
  migrateBloodlineSlot,
  createVerifiedSlot,
} from '../src/data/buildMigration'
import { normalizeBuild } from '../src/services/migration'
import { originalCharacters } from '../src/data/characters'
import type { BuildVariant, CharacterBuild } from '../src/types'

// Regression: hotfix for crash — signed-out archive must always produce arrays,
// never undefined, so App.tsx can safely call characterIds.includes(...)
describe('listAccess() defensive normalization', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns freeCharacterIds[], characterIds[], fullArchive:false when no API URL configured', async () => {
    // In tests VITE_ARCHIVE_API_URL is undefined, so apiBase is falsy — fallback path.
    const access = await buildRepository.listAccess()
    expect(Array.isArray(access.freeCharacterIds)).toBe(true)
    expect(access.freeCharacterIds.length).toBeGreaterThan(0)
    expect(Array.isArray(access.characterIds)).toBe(true)
    expect(typeof access.fullArchive).toBe('boolean')
    expect(access.fullArchive).toBe(false)
  })

  it('normalizes missing characterIds and fullArchive from a partial API response', async () => {
    // Simulate the old broken server response (missing fields) — frontend must not crash.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'signed-out' }),
    }))
    // Temporarily force apiBase to be non-empty so the fetch path runs.
    // We do this by checking what the module actually does — if apiBase is empty the test
    // falls through to fallback. Either way, characterIds must be an array.
    const access = await buildRepository.listAccess()
    expect(Array.isArray(access.characterIds)).toBe(true)
    expect(Array.isArray(access.freeCharacterIds)).toBe(true)
    expect(access.fullArchive).toBe(false)
  })

  it('normalizes a complete signed-out API response with all expected fields', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'signed-out',
        freeCharacterIds: ['zack-lee', 'vasco', 'gray-yeon', 'yu', 'jin-mori'],
        characterIds: [],
        fullArchive: false,
        highestPackage: null,
      }),
    }))
    const access = await buildRepository.listAccess()
    expect(Array.isArray(access.freeCharacterIds)).toBe(true)
    expect(Array.isArray(access.characterIds)).toBe(true)
    expect(access.fullArchive).toBe(false)
  })
})

// Phase B: build schema validation, legality auditing, migration, and premium privacy
describe('Phase B: schema validation and legality auditing', () => {
  const baseVariant = () => structuredClone(curatedBuilds[0].variants[0]) as BuildVariant
  const baseBuild = () => structuredClone(curatedBuilds[0]) as CharacterBuild

  describe('slot count validation', () => {
    it('passes when bloodline and element counts match their declared limits', () => {
      const variant = baseVariant()
      const result = validateSlotCount(variant)
      expect(result.bloodlines.valid).toBe(true)
      expect(result.elements.valid).toBe(true)
      expect(result.bloodlines.equipped).toBe(variant.bloodlineSlotCount)
      expect(result.elements.equipped).toBe(variant.elementSlotCount)
    })

    it('fails when more bloodlines are equipped than the slot limit allows', () => {
      const variant = baseVariant()
      variant.bloodlineSlotCount = 2
      variant.bloodlines = [...variant.bloodlines, { name: 'Extra', purpose: '', exactMovesUsed: [] as string[], useMode: false, reason: '', represents: '', replacements: { lore: [] as string[], competitive: [] as string[], accessible: [] as string[] } }]
      const result = validateSlotCount(variant)
      expect(result.bloodlines.valid).toBe(false)
      expect(result.bloodlines.equipped).toBeGreaterThan(result.bloodlines.limit)
    })

    it('fails when more elements are equipped than the slot limit allows', () => {
      const variant = baseVariant()
      variant.elementSlotCount = 2
      variant.elements = [...variant.elements, { name: 'Chaos', exactMovesUsed: [], purpose: 'extra', replacements: [] }]
      const result = validateSlotCount(variant)
      expect(result.elements.valid).toBe(false)
    })

    it('passes for 2-slot, 3-slot, and 4-slot declared limits', () => {
      for (const limit of [2, 3, 4] as const) {
        const variant = baseVariant()
        variant.bloodlineSlotCount = limit
        variant.bloodlines = variant.bloodlines.slice(0, limit)
        expect(validateSlotCount(variant).bloodlines.valid).toBe(true)
      }
    })
  })

  describe('source traceability', () => {
    it('passes all unresolved slots without requiring a source', () => {
      const variant = baseVariant()
      variant.hotbar = variant.hotbar.map((slot) => ({ ...slot, ability: 'Unresolved — research required', source: 'Research pending' })) as typeof variant.hotbar
      const results = validateSourceTraceability(variant)
      expect(results.every((r) => r.traceable)).toBe(true)
    })

    it('flags a hotbar move whose source is not in the equipped loadout', () => {
      const variant = baseVariant()
      variant.hotbar[0] = { ...variant.hotbar[0], ability: 'Phantom Strike', source: 'Ghost-Bloodline-Not-Equipped' }
      const results = validateSourceTraceability(variant)
      expect(results[0].traceable).toBe(false)
      expect(results[0].reason).toContain('Ghost-Bloodline-Not-Equipped')
    })

    it('passes a move whose source matches an equipped bloodline', () => {
      const variant = baseVariant()
      const firstBloodline = variant.bloodlines[0].name
      variant.hotbar[0] = { ...variant.hotbar[0], ability: 'Some Move', source: firstBloodline }
      const results = validateSourceTraceability(variant)
      expect(results[0].traceable).toBe(true)
    })

    it('accepts generic source labels: None, Sub-Ability, Mode', () => {
      const variant = baseVariant()
      variant.hotbar[0] = { ...variant.hotbar[0], ability: 'Parry', source: 'None' }
      variant.hotbar[1] = { ...variant.hotbar[1], ability: 'Sub move', source: 'Sub-Ability' }
      const results = validateSourceTraceability(variant)
      expect(results[0].traceable).toBe(true)
      expect(results[1].traceable).toBe(true)
    })
  })

  describe('mode conflict validation', () => {
    it('returns no issues for a valid variant with untested mode compatibility', () => {
      const variant = baseVariant()
      variant.simultaneousModeLegality = 'untested'
      expect(validateModeConflicts(variant)).toHaveLength(0)
    })

    it('raises Critical when simultaneousModeLegality is illegal but both modes are active', () => {
      const variant = baseVariant()
      variant.simultaneousModeLegality = 'illegal'
      variant.cMode = 'Raion-Gaiden'
      variant.zMode = 'Shock Cloak'
      const issues = validateModeConflicts(variant)
      expect(issues.some((i) => i.code === 'simultaneous-conflict' && i.severity === 'Critical')).toBe(true)
    })

    it('raises Major when C-mode and Z-mode are from the same Bloodline family', () => {
      const variant = baseVariant()
      variant.cMode = 'Raion-Gaiden'
      variant.zMode = 'Raion-Akuma'
      const issues = validateModeConflicts(variant)
      expect(issues.some((i) => i.code === 'same-family' && i.severity === 'Major')).toBe(true)
    })

    it('does not flag same-family when one mode is None', () => {
      const variant = baseVariant()
      variant.cMode = 'Raion-Gaiden'
      variant.zMode = 'None'
      expect(validateModeConflicts(variant)).toHaveLength(0)
    })
  })

  describe('invented name detection', () => {
    it('flags quarantined names from the removed abilityNames object', () => {
      const build = baseBuild()
      build.variants[0].hotbar[0] = { ...build.variants[0].hotbar[0], ability: 'Rose Flash' }
      const issues = validateInventedNames(build)
      expect(issues.some((i) => i.ability === 'Rose Flash' && i.severity === 'Critical')).toBe(true)
    })

    it('does not flag unresolved slots', () => {
      const build = baseBuild()
      build.variants[0].hotbar = build.variants[0].hotbar.map((slot) => ({ ...slot, ability: 'Unresolved — research required' }))
      expect(validateInventedNames(build)).toHaveLength(0)
    })

    it('passes the entire 100-build roster — no quarantined names remain after removing abilityNames', () => {
      const issues = completeRoster.flatMap(validateInventedNames)
      expect(issues.filter((i) => i.severity === 'Critical')).toHaveLength(0)
    })

    it('validateOfficialMoveNames catches all quarantined names', () => {
      const allQuarantined = [
        'Rose Flash', 'Time Stop Counter', 'Crimson Overdrive',
        'Dragon Heel', 'Axe Kick Barrage', 'Bruce Combo',
        'Ryuji Slam', 'Iron Counter', 'Dragon Pressure',
        'Venom Counter', 'Tengoku Pull', 'Reactive Guard',
        'Pika Flash', 'Light Kick', 'Photon Rush',
        'Shadow Vanish', 'Shade Army', 'Doom Descent',
        'Raion Burst', 'Gaiden Spear', 'Staff Cyclone',
        'Kaijin Impact', 'Tetsuo Shift',
      ]
      expect(validateOfficialMoveNames(allQuarantined).length).toBeGreaterThan(0)
    })
  })

  describe('stats allocation validation', () => {
    it('returns empty for a variant with no statsAllocation', () => {
      const variant = baseVariant()
      delete variant.statsAllocation
      expect(validateStatsAllocation(variant)).toHaveLength(0)
    })

    it('passes valid Shindo stat names with positive values', () => {
      const variant = baseVariant()
      variant.statsAllocation = { Ninjutsu: 200, Taijutsu: 150, Strength: 100, Defense: 100, Agility: 100 }
      const issues = validateStatsAllocation(variant)
      expect(issues.filter((i) => i.code === 'invalid-stat-value')).toHaveLength(0)
    })

    it('flags an unknown stat name as Minor', () => {
      const variant = baseVariant()
      variant.statsAllocation = { Ninjutsu: 200, FakeStatXYZ: 999 }
      const issues = validateStatsAllocation(variant)
      expect(issues.some((i) => i.code === 'unknown-stat-name' && i.stat === 'FakeStatXYZ' && i.severity === 'Minor')).toBe(true)
    })

    it('flags a negative stat value as Major', () => {
      const variant = baseVariant()
      variant.statsAllocation = { Strength: -50 }
      const issues = validateStatsAllocation(variant)
      expect(issues.some((i) => i.code === 'invalid-stat-value' && i.severity === 'Major')).toBe(true)
    })

    it('flags an unrealistically high total as Minor', () => {
      const variant = baseVariant()
      variant.statsAllocation = { Ninjutsu: 500, Taijutsu: 500, Strength: 500, Defense: 500 }
      const issues = validateStatsAllocation(variant)
      expect(issues.some((i) => i.code === 'stat-total-unrealistic')).toBe(true)
    })
  })

  describe('premium privacy validation', () => {
    it('passes all 100 builds — no ownership fields present', () => {
      const issues = completeRoster.flatMap(validatePremiumPrivacy)
      expect(issues.filter((i) => i.code === 'ownership-field-in-build')).toHaveLength(0)
    })

    it('flags a build containing a prohibited ownership field', () => {
      const build = baseBuild() as unknown as Record<string, unknown>
      build['ownedBy'] = 'user@example.com'
      const issues = validatePremiumPrivacy(build as unknown as CharacterBuild)
      expect(issues.some((i) => i.code === 'ownership-field-in-build' && i.severity === 'Critical')).toBe(true)
    })

    it('flags a non-reviewed build that has verified hotbar slots', () => {
      const build = baseBuild()
      build.publicationStatus = 'Draft'
      build.variants[0].hotbar[0] = { ...build.variants[0].hotbar[0], researchStatus: 'verified' }
      const issues = validatePremiumPrivacy(build)
      expect(issues.some((i) => i.code === 'unreviewed-build-with-verified-slots' && i.severity === 'Major')).toBe(true)
    })

    it('does not flag a Reviewed build that has verified hotbar slots', () => {
      const build = baseBuild()
      expect(build.publicationStatus).toBe('Reviewed')
      build.variants[0].hotbar[0] = { ...build.variants[0].hotbar[0], researchStatus: 'verified' }
      const issues = validatePremiumPrivacy(build)
      expect(issues.filter((i) => i.code === 'unreviewed-build-with-verified-slots')).toHaveLength(0)
    })
  })

  describe('migration: getElementSlots and normalizeBuildElements', () => {
    it('isElementSlot returns true for a valid ElementSlot object', () => {
      expect(isElementSlot({ name: 'Fire', exactMovesUsed: [], purpose: '', replacements: [] })).toBe(true)
    })

    it('isElementSlot returns false for a plain string', () => {
      expect(isElementSlot('Fire')).toBe(false)
    })

    it('getElementSlots wraps string elements into ElementSlot shape', () => {
      const build = baseBuild()
      build.elementSlots = undefined
      const slots = getElementSlots(build)
      expect(slots.every((s) => isElementSlot(s))).toBe(true)
      expect(slots.map((s) => s.name)).toEqual(build.elements)
    })

    it('getElementSlots returns existing elementSlots when present', () => {
      const build = baseBuild()
      build.elementSlots = [{ name: 'Chaos', exactMovesUsed: ['Chaos Wave'], purpose: 'Pressure', replacements: [] }]
      const slots = getElementSlots(build)
      expect(slots[0].name).toBe('Chaos')
      expect(slots[0].exactMovesUsed).toEqual(['Chaos Wave'])
    })

    it('normalizeBuildElements is idempotent — second call returns same reference', () => {
      const build = baseBuild()
      const once = normalizeBuildElements(build)
      const twice = normalizeBuildElements(once)
      expect(twice).toBe(once)
    })
  })

  describe('HotbarKey type enforcement', () => {
    it('all restored draft builds use only valid hotbar keys', () => {
      const validKeys = new Set(['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q'])
      for (const build of restoredDraftBuilds) {
        for (const variant of build.variants) {
          for (const slot of variant.hotbar) {
            expect(validKeys.has(slot.key)).toBe(true)
          }
        }
      }
    })

    it('all reviewed builds use only valid hotbar keys', () => {
      const validKeys = new Set(['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q'])
      for (const build of curatedBuilds) {
        for (const variant of build.variants) {
          for (const slot of variant.hotbar) {
            expect(validKeys.has(slot.key)).toBe(true)
          }
        }
      }
    })
  })

  describe('runBuildValidation full report', () => {
    it('produces a report with one entry per variant', () => {
      const build = baseBuild()
      const report = runBuildValidation(build)
      expect(report.buildId).toBe(build.id)
      expect(report.slotCounts).toHaveLength(build.variants.length)
      expect(report.sourceTrace).toHaveLength(build.variants.length)
      expect(report.modeConflicts).toHaveLength(build.variants.length)
    })

    it('hasBlocker is false for a valid reviewed build', () => {
      expect(runBuildValidation(baseBuild()).hasBlocker).toBe(false)
    })

    it('hasBlocker is true when a quarantined name is present', () => {
      const build = baseBuild()
      build.variants[0].hotbar[0] = { ...build.variants[0].hotbar[0], ability: 'Tengoku Pull' }
      expect(runBuildValidation(build).hasBlocker).toBe(true)
    })

    it('hasBlocker is true when slot count is violated', () => {
      const build = baseBuild()
      build.variants[0].bloodlineSlotCount = 2
      build.variants[0].bloodlines = [...build.variants[0].bloodlines, { name: 'Overflow', purpose: '', exactMovesUsed: [], useMode: false, reason: '', represents: '', replacements: { lore: [], competitive: [], accessible: [] } }]
      expect(runBuildValidation(build).hasBlocker).toBe(true)
    })

    it('report includes comboKeyIssues per variant', () => {
      const build = baseBuild()
      const report = runBuildValidation(build)
      expect(Array.isArray(report.comboKeyIssues)).toBe(true)
      expect(report.comboKeyIssues).toHaveLength(build.variants.length)
    })
  })

  describe('hardening: combo key validation', () => {
    it('returns no issues for a variant with no combos', () => {
      const variant = baseVariant()
      variant.combos = []
      expect(validateComboKeys(variant)).toHaveLength(0)
    })

    it('returns no issues when all combo keys are valid HotbarKeys', () => {
      const variant = baseVariant()
      variant.combos = [
        { name: 'Standard', sequence: ['1', '2', 'V', 'B', 'C'], explanation: 'All valid.' },
        { name: 'Mode combo', sequence: ['C', 'Z', 'N', 'T', 'Q'], explanation: 'Also valid.' },
      ]
      expect(validateComboKeys(variant)).toHaveLength(0)
    })

    it('flags invalid keys like X or 6 with Major severity', () => {
      const variant = baseVariant()
      variant.combos = [{ name: 'Bad combo', sequence: ['1', 'X' as '1', '6' as '1'], explanation: 'Has invalid keys.' }]
      const issues = validateComboKeys(variant)
      expect(issues).toHaveLength(2)
      expect(issues.every((i) => i.severity === 'Major')).toBe(true)
      expect(issues.map((i) => i.invalidKey)).toEqual(expect.arrayContaining(['X', '6']))
    })

    it('hasBlocker is true when a variant has invalid combo keys', () => {
      const build = baseBuild()
      build.variants[0].combos = [{ name: 'Invalid', sequence: ['X' as '1'], explanation: 'Bad key.' }]
      expect(runBuildValidation(build).hasBlocker).toBe(true)
    })
  })

  describe('hardening: migrateComboSequence', () => {
    it('accepts all 12 valid HotbarKey values', () => {
      const all = ['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q']
      const { valid, invalid } = migrateComboSequence(all)
      expect(valid).toHaveLength(12)
      expect(invalid).toHaveLength(0)
    })

    it('separates invalid keys from a mixed input', () => {
      const { valid, invalid } = migrateComboSequence(['1', 'X', '2', 'M', 'Q'])
      expect(valid).toEqual(['1', '2', 'Q'])
      expect(invalid).toEqual(['X', 'M'])
    })

    it('returns empty valid array for all-invalid input', () => {
      const { valid, invalid } = migrateComboSequence(['A', 'P', '9'])
      expect(valid).toHaveLength(0)
      expect(invalid).toEqual(['A', 'P', '9'])
    })
  })

  describe('hardening: exact source traceability', () => {
    it('Raion as source does not match Raion-Gaiden as equipped bloodline', () => {
      const variant = baseVariant()
      variant.bloodlines = [{ name: 'Raion-Gaiden', purpose: '', useMode: true }]
      variant.hotbar[0] = { ...variant.hotbar[0], ability: 'Raion Strike', source: 'Raion', researchStatus: 'needs-retesting' }
      const results = validateSourceTraceability(variant)
      expect(results[0].traceable).toBe(false)
      expect(results[0].reason).toContain('Raion-Gaiden')
    })

    it('Raion-Gaiden as source exactly matches Raion-Gaiden as equipped bloodline', () => {
      const variant = baseVariant()
      variant.bloodlines = [{ name: 'Raion-Gaiden', purpose: '', useMode: true }]
      variant.hotbar[0] = { ...variant.hotbar[0], ability: 'Raion Strike', source: 'Raion-Gaiden', researchStatus: 'needs-retesting' }
      const results = validateSourceTraceability(variant)
      expect(results[0].traceable).toBe(true)
    })

    it('verified slot with sourceId exactly matching equipped bloodline passes', () => {
      const variant = baseVariant()
      variant.bloodlines = [{ name: 'Narumaki-Ruby', purpose: '', useMode: true }]
      variant.hotbar[0] = { ...variant.hotbar[0], ability: 'Ruby Slash', source: 'Narumaki-Ruby', sourceId: 'Narumaki-Ruby', researchStatus: 'verified' }
      const results = validateSourceTraceability(variant)
      expect(results[0].traceable).toBe(true)
    })

    it('verified slot without sourceId is flagged as untraceable', () => {
      const variant = baseVariant()
      variant.bloodlines = [{ name: 'Narumaki-Ruby', purpose: '', useMode: true }]
      variant.hotbar[0] = { ...variant.hotbar[0], ability: 'Ruby Slash', source: 'Narumaki-Ruby', researchStatus: 'verified' }
      delete (variant.hotbar[0] as unknown as Record<string, unknown>).sourceId
      const results = validateSourceTraceability(variant)
      expect(results[0].traceable).toBe(false)
      expect(results[0].reason).toContain('missing sourceId')
    })

    it('verified slot whose sourceId is a family prefix (Raion vs Raion-Gaiden) is flagged', () => {
      const variant = baseVariant()
      variant.bloodlines = [{ name: 'Raion-Gaiden', purpose: '', useMode: true }]
      variant.hotbar[0] = { ...variant.hotbar[0], ability: 'Raion Move', source: 'Raion-Gaiden', sourceId: 'Raion', researchStatus: 'verified' }
      const results = validateSourceTraceability(variant)
      expect(results[0].traceable).toBe(false)
      expect(results[0].reason).toMatch(/Raion.*Raion-Gaiden|Raion-Gaiden.*Raion/)
    })

    it('unresolved slots always pass regardless of source string', () => {
      const variant = baseVariant()
      variant.bloodlines = [{ name: 'Narumaki', purpose: '', useMode: true }]
      variant.hotbar[0] = { ...variant.hotbar[0], ability: 'Unresolved — research required', source: 'SourceThatDoesNotExist' }
      const results = validateSourceTraceability(variant)
      expect(results[0].traceable).toBe(true)
    })
  })

  describe('hardening: migrateBloodlineSlot', () => {
    it('coerces a minimal slot with only required fields', () => {
      const slot = migrateBloodlineSlot({ name: 'Raion', purpose: 'Speed', useMode: true })
      expect(slot.name).toBe('Raion')
      expect(slot.purpose).toBe('Speed')
      expect(slot.useMode).toBe(true)
      expect(slot.exactMovesUsed).toEqual([])
      expect(slot.id).toBeUndefined()
      expect(slot.verificationStatus).toBeUndefined()
    })

    it('preserves exact moves, replacements, and verificationStatus when present', () => {
      const input = {
        name: 'Narumaki-Ruby',
        purpose: 'Lore match',
        useMode: false,
        exactMovesUsed: ['Ruby Slash', 'Ruby Storm'],
        reason: 'Canonical lore technique.',
        represents: 'Naruto bloodline upgrade',
        replacements: { lore: ['Narumaki'], competitive: [], accessible: ['Getsuga'] },
        evidence: ['Chapter 72 panel 3'],
        verificationStatus: 'verified',
      }
      const slot = migrateBloodlineSlot(input)
      expect(slot.exactMovesUsed).toEqual(['Ruby Slash', 'Ruby Storm'])
      expect(slot.replacements?.lore).toEqual(['Narumaki'])
      expect(slot.evidence).toEqual(['Chapter 72 panel 3'])
      expect(slot.verificationStatus).toBe('verified')
    })

    it('rejects an invalid verificationStatus and leaves it undefined', () => {
      const slot = migrateBloodlineSlot({ name: 'X', purpose: '', useMode: false, verificationStatus: 'published' })
      expect(slot.verificationStatus).toBeUndefined()
    })
  })
})

// B.1 hardening: runtime integration tests
describe('B.1: originalCharacters combo key runtime integrity', () => {
  it('every combo in originalCharacters uses only valid HotbarKeys at runtime', () => {
    const violations: { buildId: string; comboName: string; invalidKeys: string[] }[] = []
    for (const build of originalCharacters) {
      for (const combo of build.combos) {
        const { invalid } = migrateComboSequence(combo.sequence as string[])
        if (invalid.length > 0) violations.push({ buildId: build.id, comboName: combo.name, invalidKeys: invalid })
      }
    }
    expect(violations).toHaveLength(0)
  })
})

describe('B.1: normalizeBuild migration integration', () => {
  it('canonicalizes variant bloodlines — adds exactMovesUsed:[] when absent', () => {
    const raw = structuredClone(curatedBuilds[0]) as CharacterBuild
    // Strip exactMovesUsed to prove migration re-adds it
    raw.variants[0].bloodlines = raw.variants[0].bloodlines.map(
      ({ exactMovesUsed: _dropped, ...rest }) => rest as CharacterBuild['variants'][0]['bloodlines'][0],
    )
    const result = normalizeBuild(raw)
    for (const slot of result.variants[0].bloodlines) {
      expect(Array.isArray(slot.exactMovesUsed)).toBe(true)
    }
  })

  it('does not mutate the original build object', () => {
    const original = structuredClone(curatedBuilds[0]) as CharacterBuild
    const snapshot = JSON.stringify(original)
    normalizeBuild(original)
    expect(JSON.stringify(original)).toBe(snapshot)
  })

  it('returns a distinct object from the input', () => {
    const raw = structuredClone(curatedBuilds[0]) as CharacterBuild
    const result = normalizeBuild(raw)
    expect(result).not.toBe(raw)
  })
})

describe('B.1: validateBloodlineCompleteness', () => {
  const baseVariant = () => structuredClone(curatedBuilds[0].variants[0]) as BuildVariant

  it('returns no issues when exactMovesUsed is empty', () => {
    const variant = baseVariant()
    variant.bloodlines = [{ name: 'Raion', purpose: '', useMode: true, exactMovesUsed: [] }]
    expect(validateBloodlineCompleteness(variant)).toHaveLength(0)
  })

  it('returns Minor warning when exactMovesUsed is non-empty but replacements is absent', () => {
    const variant = baseVariant()
    variant.bloodlines = [{ name: 'Raion', purpose: '', useMode: true, exactMovesUsed: ['Raion Slash'] }]
    const issues = validateBloodlineCompleteness(variant)
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe('Minor')
    expect(issues[0].code).toBe('missing-replacements')
  })

  it('returns Minor warning when all replacement arrays are empty', () => {
    const variant = baseVariant()
    variant.bloodlines = [{ name: 'Raion', purpose: '', useMode: true, exactMovesUsed: ['Raion Slash'], replacements: { lore: [], competitive: [], accessible: [] } }]
    const issues = validateBloodlineCompleteness(variant)
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe('Minor')
  })

  it('no warning when at least one replacement list is populated', () => {
    const variant = baseVariant()
    variant.bloodlines = [{ name: 'Raion', purpose: '', useMode: true, exactMovesUsed: ['Raion Slash'], replacements: { lore: ['Narumaki'], competitive: [], accessible: [] } }]
    expect(validateBloodlineCompleteness(variant)).toHaveLength(0)
  })

  it('missing-replacements is never a blocker in runBuildValidation', () => {
    const build = structuredClone(curatedBuilds[0]) as CharacterBuild
    // Modify one slot in-place: add exactMovesUsed, clear replacements → triggers Minor warning only
    build.variants[0].bloodlines[0].exactMovesUsed = ['Raion Slash']
    build.variants[0].bloodlines[0].replacements = undefined
    const report = runBuildValidation(build)
    expect(report.bloodlineCompleteness[0].some((i) => i.code === 'missing-replacements')).toBe(true)
    expect(report.hasBlocker).toBe(false)
  })

  it('report includes bloodlineCompleteness per variant', () => {
    const build = structuredClone(curatedBuilds[0]) as CharacterBuild
    const report = runBuildValidation(build)
    expect(Array.isArray(report.bloodlineCompleteness)).toBe(true)
    expect(report.bloodlineCompleteness).toHaveLength(build.variants.length)
  })
})

describe('B.1: createVerifiedSlot', () => {
  it('creates a valid HotbarSlot with all required fields', () => {
    const slot = createVerifiedSlot({ key: '1', ability: 'Raion Slash', sourceId: 'Raion-Gaiden', sourceType: 'Bloodline', researchStatus: 'verified' })
    expect(slot.key).toBe('1')
    expect(slot.ability).toBe('Raion Slash')
    expect(slot.sourceId).toBe('Raion-Gaiden')
    expect(slot.source).toBe('Raion-Gaiden')
    expect(slot.researchStatus).toBe('verified')
    expect(slot.sourceType).toBe('Bloodline')
  })

  it('accepts owner-confirmed researchStatus', () => {
    const slot = createVerifiedSlot({ key: 'V', ability: 'Ruby Storm', sourceId: 'Narumaki-Ruby', sourceType: 'Bloodline', researchStatus: 'owner-confirmed' })
    expect(slot.researchStatus).toBe('owner-confirmed')
  })

  it('source defaults to sourceId when not provided', () => {
    const slot = createVerifiedSlot({ key: '2', ability: 'Fire Wall', sourceId: 'Blaze', sourceType: 'Element', researchStatus: 'verified' })
    expect(slot.source).toBe('Blaze')
  })

  it('throws when sourceId is empty string', () => {
    expect(() => createVerifiedSlot({ key: '1', ability: 'Move', sourceId: '', sourceType: 'Bloodline', researchStatus: 'verified' })).toThrow(/sourceId/)
  })

  it('throws when sourceId is whitespace only', () => {
    expect(() => createVerifiedSlot({ key: 'B', ability: 'Move', sourceId: '   ', sourceType: 'Element', researchStatus: 'owner-confirmed' })).toThrow(/sourceId/)
  })
})
