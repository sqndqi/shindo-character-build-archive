import type { BuildEvidence, BuildVariant, CharacterBuild, HotbarSlot } from '../types'

const checkedAt = '2026-07-29'
const gameUpdate = 'Live build reviewed 2026-07-29'
const keys = ['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q'] as const

const moves: Record<string, string[]> = {
  'Dio-Senko-Rose': ['Time Style: Ultimate Flash', 'Time Style: Time Jump', 'Time Style: Time Stop'],
  'Bruce-Kenichi': ['Fist Style: 6th Dance', 'Fist Style: 9th Dance', 'Fist Style: Tiger Lotus'],
  'Pika-Senko': ['Time Style: Star Kick', 'Time Style: Star Kick Rising', 'Time Style: Star Bomb Barrage'],
  'Doku-Tengoku': ['Tengoku Style: Concentrated Palm Blast', 'Tengoku Style: Twin Dragon Barrage', 'Tengoku Style: 128 Palm Counter'],
  'Ryuji-Kenichi': ['Fist Style: 3rd Stance', 'Fist Style: Dragon Demon Combo', 'Fist Style: Dragon Lotus'],
  Akuma: ['Copy Style: Reality Control', 'Copy Style: Reflex Enhance', 'Copy Style: Blaze Invert'],
  'Minakaze-Azure': ['Minakaze Style: Kunai Raijin', 'Minakaze Style: Sunsengan Barrage', 'Minakaze Style: Sunsengan Overdrive'],
  Kenichi: ['Fist Style: Dragon Strike', 'Fist Style: Crane Demon', 'Fist Style: Ultimate Tempo'],
  'Shindai-Rengoku': ['Rengoku Style: Under The Sun', 'Rengoku Style: Great Majestic Blaze', 'Rengoku Style: Tailed Spirit Counter'],
  'Getsuga-Black': ['Kor Style: Hand of Getsuga', 'Kor Style: Rasensuga', 'Kor Style: Getsuga Shuriken Blitz'],
  Minakaze: ['Minakaze Style: Kunai Raijin', 'Minakaze Style: Sunsengan Barrage', 'Minakaze Style: Sunsengan Overdrive'],
  'Dio-Senko': ['Ultimate Flash', 'Time Style: Time Jump', 'Time Style: Time Stop'],
  Azarashi: ['Chain Style: Chains Of Guard', 'Chain Style: Unchained', 'Chain Style: Chain Chi Drain'],
  Gale: ['Gale Style: Vortex', 'Gale Style: Windshock', 'Gale Style: Wind Current', 'Gale Style: Blast', 'Gale Style: Wind Shock Slam', 'Gale Style: Storm Burst'],
  Order: ['Order Style: Beam of Light', 'Order Style: Grenade of Light', 'Order Style: Shock of Light', 'Order Style: Bomb of Light', 'Order Style: Blade of Light', 'Order Style: Gravity of Light'],
  Earth: ['Stone Style: Earth Wall', 'Stone Style: Rage Trail', 'Stone Style: Earth Barrier', 'Stone Style: Stone Barrage', 'Stone Style: Earth Dragon', 'Stone Style: Earth Pillars'],
  Lightning: ['Shock Style: Stream', 'Shock Style: Blast', 'Shock Style: Senbon', 'Shock Style: Electro Control', 'Shock Style: Thunder Rain', 'Shock Style: Dragon Bomb'],
  Fire: ['Flame Style: Flame Bullet', 'Flame Style: Flame Breath', 'Flame Style: Grand Flameball', 'Flame Style: Pheonix Rising', 'Flame Style: Dragon Bullet', 'Flame Style: Dragon Bomb'],
}

type MoveChoice = [source: string, move: string, role: HotbarSlot['comboRole'], purpose: string, blockBreak?: boolean]

function hotbar(id: string, choices: MoveChoice[]): HotbarSlot[] {
  if (choices.length !== 12) throw new Error(`${id} must author all 12 hotbar slots`)
  return choices.map(([source, ability, comboRole, purpose, blockBreak], index) => ({
    id: `${id}-hotbar-${keys[index]}`,
    key: keys[index],
    ability,
    source,
    purpose,
    comboRole,
    blockBreak: Boolean(blockBreak),
    usageNotes: 'Verify resource cost and timing in the current live build before ranked use.',
  }))
}

function bloodline(name: string, purpose: string, useMode = false) {
  return {
    name,
    purpose,
    exactMovesUsed: moves[name]?.slice(0, 3) ?? [],
    useMode,
    reason: purpose,
    represents: purpose,
    replacements: { lore: [], competitive: [], accessible: [] },
  }
}

function element(name: string, selected: number[], purpose: string) {
  return { name, exactMovesUsed: selected.map((index) => moves[name][index]), purpose, replacements: [] }
}

const commonEvidence = (bloodlines: string[]): BuildEvidence[] => bloodlines.map((name) => ({
  category: 'Game',
  claim: `${name} move names and mode availability`,
  sourceTitle: `${name} — Shindo Life Wiki`,
  sourceReference: `https://shindo-life-rell.fandom.com/wiki/${encodeURIComponent(name)}`,
  checkedAt,
  notes: 'Community wiki reference checked; live-game frame data still requires retesting.',
}))

function variant(input: Omit<BuildVariant, 'verificationStatus' | 'lastVerifiedUpdate'>): BuildVariant {
  return { ...input, verificationStatus: 'Needs Retesting', lastVerifiedUpdate: gameUpdate }
}

const jamesFour = variant({
  id: 'james-current-4x2', name: 'Recommended four-slot', type: 'Primary', bloodlineSlotCount: 4, elementSlotCount: 2,
  bloodlines: [
    bloodline('Dio-Senko-Rose', 'Represents James Lee’s speed threshold and is the recommended C-mode.', true),
    bloodline('Bruce-Kenichi', 'Represents his precise kick combinations and close-range technique.'),
    bloodline('Pika-Senko', 'Used for explosive light-speed kick pressure; its mode stays disabled.'),
    bloodline('Doku-Tengoku', 'Provides the reactive counter and close-range control layer.'),
  ],
  elements: [element('Gale', [0, 4], 'Movement control and wind-pressure extension.'), element('Order', [3, 4], 'Explosive light pressure and a blade-like visual substitute.')],
  cMode: 'Dio-Senko-Rose — Stage 1', zMode: 'None — avoids changing the build silhouette', combatArt: 'Jeet Kune Do', weapon: 'None',
  ninjaTool: 'Shock Bomb', consumable: 'Chi Pot', mentor: 'Bruce Kenichi', race: 'Human',
  hotbar: hotbar('james-current-4x2', [
    ['Order', moves.Order[3], 'Starter', 'Ranged guard pressure.', true],
    ['Gale', moves.Gale[0], 'Extender', 'Pulls movement into kick range.'],
    ['Dio-Senko-Rose', moves['Dio-Senko-Rose'][0], 'Mobility', 'Primary speed-threshold engage.'],
    ['Bruce-Kenichi', moves['Bruce-Kenichi'][0], 'Starter', 'Launches into the kick route.'],
    ['Pika-Senko', moves['Pika-Senko'][0], 'Finisher', 'Explosive kick cash-out.'],
    ['Doku-Tengoku', moves['Doku-Tengoku'][2], 'Counter', 'Reactive punish and reversal.'],
    ['Bruce-Kenichi', moves['Bruce-Kenichi'][1], 'Extender', 'Aerial kick continuation.'],
    ['Pika-Senko', moves['Pika-Senko'][1], 'Mobility', 'Rising kick chase.'],
    ['Doku-Tengoku', moves['Doku-Tengoku'][1], 'Extender', 'Close-range barrage control.'],
    ['Dio-Senko-Rose', 'Dio-Senko-Rose Mode — Stage 1', 'Mode ability', 'Main speed mode.'],
    ['None', 'No Z-mode equipped', 'Defense', 'Preserves weaponless visual accuracy.'],
    ['Combat Art', 'Jeet Kune Do basic string', 'Starter', 'Low-resource confirm.'],
  ]),
  combos: [
    { name: 'Main combo', sequence: ['1', '3', '4', 'V', 'B', '5'], explanation: 'Bomb of Light pressure into speed engage and the authored kick route.' },
    { name: 'Counter route', sequence: ['T', '3', '4', '5'], explanation: '128 Palm Counter creates the punish window before the kick cash-out.' },
    { name: 'Guard-break route', sequence: ['1', 'Q', '3', 'B'], explanation: 'Lead with the verified Order guard-pressure slot, then confirm before extending.' },
    { name: 'Low-resource route', sequence: ['Q', '4', 'V', '5'], explanation: 'Combat-art confirm using fewer high-Chi Bloodline moves.' },
    { name: 'Escape route', sequence: ['T', '3'], explanation: 'Counter first; use Ultimate Flash to disengage rather than overextend.' },
  ],
  ratings: { accuracy: 9.4, pvp: 8.8, mobility: 9.7, combos: 9.0, defense: 7.8, visuals: 9.5, aura: 9.4, difficulty: 8.8 },
  strengths: ['Clear speed-threshold identity', 'Multiple kick confirms', 'A reactive counter without changing the core mode'],
  weaknesses: ['Resource costs need current-update retesting', 'No Z-mode safety net', 'Four Bloodline ownership requirement'],
  usageGuide: ['Open with Order or Gale pressure.', 'Confirm before spending Pika-Senko.', 'Keep Doku-Tengoku counter available while Dio mode is active.'],
})

function reducedJames(id: string, count: 2 | 3, names: string[], type: 'Two Slot' | 'Three Slot'): BuildVariant {
  const included = jamesFour.bloodlines.filter((slot) => names.includes(slot.name))
  const choices = jamesFour.hotbar.filter((slot) => names.includes(slot.source) || ['Order', 'Gale', 'None', 'Combat Art'].includes(slot.source))
  const authored = choices.filter((slot) => !['None', 'Combat Art'].includes(slot.source)).slice(0, 10)
  const support: MoveChoice[] = [
    ['Order', moves.Order[4], 'Finisher', 'Blade-like light finisher.', false],
    ['Gale', moves.Gale[4], 'Guard break', 'Reduced-slot wind pressure.', true],
  ]
  while (authored.length < 10) {
    const next = support[authored.length % support.length]
    authored.push({ ...jamesFour.hotbar[0], id: `${id}-support-${authored.length}`, source: next[0], ability: next[1], comboRole: next[2], purpose: next[3], blockBreak: Boolean(next[4]) })
  }
  authored.push(jamesFour.hotbar[10], jamesFour.hotbar[11])
  return variant({
    ...jamesFour, id, name: `${count}-slot focused version`, type, bloodlineSlotCount: count, bloodlines: included,
    hotbar: hotbar(id, authored.map((slot) => [slot.source, slot.ability, slot.comboRole, slot.purpose, slot.blockBreak])),
    ratings: { ...jamesFour.ratings, pvp: jamesFour.ratings.pvp - .3, combos: jamesFour.ratings.combos - .4 },
    strengths: [`Complete authored ${count}-slot route`, 'Keeps the approved speed-and-kick identity'],
    weaknesses: [...jamesFour.weaknesses, `Drops ${jamesFour.bloodlines.filter((slot) => !names.includes(slot.name)).map((slot) => slot.name).join(' and ')}`],
  })
}

const jamesThree = reducedJames('james-current-3x2', 3, ['Dio-Senko-Rose', 'Bruce-Kenichi', 'Doku-Tengoku'], 'Three Slot')
const jamesTwo = reducedJames('james-current-2x2', 2, ['Dio-Senko-Rose', 'Bruce-Kenichi'], 'Two Slot')
const jamesFourElements = variant({
  ...jamesFour, id: 'james-current-4x4', name: 'Four-element compatibility', type: 'Four Slot', elementSlotCount: 4,
  elements: [...jamesFour.elements, element('Lightning', [0], 'Adds a low-commitment shock check.'), element('Earth', [0], 'Adds a defensive wall when extra element slots are available.')],
  hotbar: hotbar('james-current-4x4', jamesFour.hotbar.map((slot, index) => index === 8
    ? ['Lightning', moves.Lightning[0], 'Extender', 'Extra-element stun check.', false]
    : [slot.source, slot.ability, slot.comboRole, slot.purpose, slot.blockBreak])),
})

type CuratedInput = {
  id: string; name: string; version: string; description: string; archetype: string[]; variants: BuildVariant[]; image: string
}

function curatedBuild(input: CuratedInput): CharacterBuild {
  const primary = input.variants[0]
  return {
    id: input.id, characterId: `character-${input.id}`, versionId: `version-${input.id}`, buildName: primary.name,
    name: input.name, series: 'Lookism', franchise: 'PTJ / Street Action', version: input.version, image: input.image,
    description: input.description, archetype: input.archetype, combatTags: ['Hand-to-hand', 'Martial arts'], customTags: ['Curated'],
    effectsIntensity: 'Medium',
    bloodlines: primary.bloodlines.map((slot, index) => ({ id: `${input.id}-bloodline-${index + 1}`, name: slot.name, purpose: slot.purpose, useMode: slot.useMode })),
    elements: primary.elements.map((slot) => slot.name), cMode: primary.cMode, zMode: primary.zMode, combatArt: primary.combatArt,
    weapon: primary.weapon, ninjaTool: primary.ninjaTool, consumable: primary.consumable, mentor: primary.mentor, race: primary.race,
    hotbar: primary.hotbar, combos: primary.combos, strengths: primary.strengths, weaknesses: primary.weaknesses,
    substitutions: primary.bloodlines.flatMap((slot) => slot.replacements.accessible), ratings: primary.ratings,
    slotAlternatives: { twoSlots: [], threeSlots: [], fourSlots: [] },
    variations: { beginner: 'Use a prepared Beginner variant when available.', meta: 'Use a prepared Competitive variant when available.', lore: 'Use a prepared Lore Accurate variant when available.' },
    notes: 'Only prepared variants are selectable. No loadout is generated at runtime.', status: 'Needs Testing',
    gameUpdate, lastVerifiedUpdate: gameUpdate, verificationStatus: 'Needs Retesting',
    createdAt: `${checkedAt}T00:00:00.000Z`, updatedAt: `${checkedAt}T00:00:00.000Z`,
    testing: { status: 'Untested', contexts: [], tester: '', testDate: '', notes: 'Live-game combo timing still requires owner testing.' },
    changeHistory: [], chapterRange: 'Current Lookism continuity; exact chapter range needs editorial confirmation',
    characterAbilities: input.archetype, knownCompromises: ['Shindo Life substitutions cannot reproduce the character one-to-one.'],
    confidence: 'Strong Match', publicationStatus: 'Reviewed', variants: input.variants,
    evidence: commonEvidence([...new Set(input.variants.flatMap((item) => item.bloodlines.map((slot) => slot.name)))]),
  }
}

function primaryVariant(id: string, bloodlineNames: string[], elementNames: string[], mode: string, combatArt: string, weapon = 'None'): BuildVariant {
  const selectedBloodlines = bloodlineNames.map((name, index) => bloodline(name, index === 0 ? 'Primary character identity and pressure engine.' : 'Reviewed supporting match.', name === mode))
  const selectedElements = elementNames.map((name) => element(name, [0, 1], 'Reviewed neutral or defensive support.'))
  const pool: MoveChoice[] = selectedBloodlines.flatMap((slot) => slot.exactMovesUsed.map((move, index) => [slot.name, move, index === 2 ? 'Counter' : index === 0 ? 'Starter' : 'Extender', slot.purpose, false] as MoveChoice))
  const elementPool: MoveChoice[] = selectedElements.flatMap((slot) => slot.exactMovesUsed.map((move) => [slot.name, move, 'Defense', slot.purpose, false] as MoveChoice))
  const authored = [...pool, ...elementPool].slice(0, 10)
  if (authored.length < 10) throw new Error(`${id} does not have enough reviewed moves for a complete hotbar`)
  authored.push([mode, `${mode} Mode — Stage 1`, 'Mode ability', 'Recommended C-mode.', false], ['None', 'No Z-mode equipped', 'Defense', 'Avoids an inaccurate transformation.', false])
  return variant({
    id: `${id}-4x2`, name: 'Reviewed primary version', type: 'Primary', bloodlineSlotCount: 4, elementSlotCount: 2,
    bloodlines: selectedBloodlines, elements: selectedElements, cMode: `${mode} — Stage 1`, zMode: 'None', combatArt, weapon,
    ninjaTool: weapon === 'None' ? 'Shock Bomb' : 'Dagai Wire', consumable: 'Chi Pot', mentor: combatArt === 'Boxing' ? 'Ryuji Kenichi' : 'Bruce Kenichi', race: 'Human',
    hotbar: hotbar(`${id}-4x2`, authored), combos: [{ name: 'Testing route', sequence: ['1', '2', '3', '4'], explanation: 'Move order is authored, but live connection timing remains marked for retesting.' }],
    ratings: { accuracy: 8.7, pvp: 8.4, mobility: 8.2, combos: 8.1, defense: 8.0, visuals: 8.6, aura: 8.8, difficulty: 8.3 },
    strengths: ['Reviewed Bloodline-to-character mapping', 'Only wiki-listed move names are displayed'],
    weaknesses: ['Combo timing needs live testing', 'No reduced-slot version is published yet'],
    usageGuide: ['Treat the displayed route as a testing plan.', 'Do not label the build current until it is tested in the live update.'],
  })
}

const entries: CuratedInput[] = [
  { id: 'james-lee', name: 'James Lee', version: 'Current — Explosive Path', description: 'Speed-threshold pressure translated through exact listed Shindo moves without changing the approved core.', archetype: ['Speed threshold', 'Explosive kicks', 'Counter'], image: '/characters/james-lee.jpg', variants: [jamesFour, jamesThree, jamesTwo, jamesFourElements] },
  { id: 'seongji-yuk', name: 'Seongji Yuk', version: 'Cheonliang — Three Thresholds', description: 'Strength, toughness and speed represented through physical Bloodlines and a reactive counter.', archetype: ['Three thresholds', 'Grappling', 'Power'], image: '/characters/seongji-yuk.jpg', variants: [primaryVariant('seongji-yuk', ['Ryuji-Kenichi', 'Dio-Senko-Rose', 'Bruce-Kenichi', 'Doku-Tengoku'], ['Earth', 'Gale'], 'Ryuji-Kenichi', 'Mixed Martial Arts')] },
  { id: 'gun-park', name: 'Gun Park', version: 'Mastered Ultra Instinct', description: 'Automatic reactions, physical pressure and durability represented without inventing an Ultra Instinct ability.', archetype: ['Ultra Instinct approximation', 'Pressure', 'Durability'], image: '/characters/gun-park.jpg', variants: [primaryVariant('gun-park', ['Akuma', 'Bruce-Kenichi', 'Ryuji-Kenichi', 'Doku-Tengoku'], ['Earth', 'Order'], 'Akuma', 'Mixed Martial Arts')] },
  { id: 'little-daniel-park', name: 'Little Daniel Park', version: 'UI and Path', description: 'Copy and prediction are approximated through Akuma control, speed and counter tools.', archetype: ['Copy approximation', 'Prediction', 'Counter'], image: '/characters/little-daniel-park.jpg', variants: [primaryVariant('little-daniel-park', ['Akuma', 'Dio-Senko-Rose', 'Bruce-Kenichi', 'Doku-Tengoku'], ['Order', 'Gale'], 'Akuma', 'Mixed Martial Arts')] },
  { id: 'johan-seong', name: 'Johan Seong', version: 'Infinite Technique', description: 'A reviewed high-execution selection for speed, copied technique and kick routing.', archetype: ['Copy approximation', 'Speed', 'Technique'], image: '/characters/johan-seong.jpg', variants: [primaryVariant('johan-seong', ['Bruce-Kenichi', 'Dio-Senko-Rose', 'Pika-Senko', 'Doku-Tengoku'], ['Gale', 'Lightning'], 'Dio-Senko-Rose', 'Mixed Martial Arts')] },
  { id: 'kitae-kim', name: 'Kitae Kim', version: 'King of Seoul', description: 'Brutal physical pressure with teleport pursuit and a deliberate weapon compromise.', archetype: ['Power', 'Brutality', 'Endurance'], image: '/characters/kitae-kim.jpg', variants: [primaryVariant('kitae-kim', ['Ryuji-Kenichi', 'Minakaze-Azure', 'Bruce-Kenichi', 'Doku-Tengoku'], ['Earth', 'Fire'], 'Ryuji-Kenichi', 'Mixed Martial Arts', 'Executioner Axe')] },
  { id: 'goo-kim', name: 'Goo Kim', version: 'Weapon Genius', description: 'Weapon-first pressure built from listed sword and counter tools.', archetype: ['Weapon genius', 'Technique', 'Unpredictability'], image: '/characters/goo-kim.jpg', variants: [primaryVariant('goo-kim', ['Kenichi', 'Shindai-Rengoku', 'Getsuga-Black', 'Doku-Tengoku'], ['Lightning', 'Order'], 'Shindai-Rengoku', 'Kenjutsu', 'Chi Blade')] },
  { id: 'jake-kim', name: 'Jake Kim', version: 'Conviction', description: 'Durable close-range leadership represented through pressure and counter tools.', archetype: ['Conviction', 'Power', 'Defense'], image: '/characters/jake-kim.jpg', variants: [primaryVariant('jake-kim', ['Ryuji-Kenichi', 'Doku-Tengoku', 'Bruce-Kenichi', 'Minakaze'], ['Earth', 'Order'], 'Ryuji-Kenichi', 'Mixed Martial Arts')] },
  { id: 'eli-jang', name: 'Eli Jang', version: 'Wildness', description: 'Irregular pursuit, grappling and improvised-weapon pressure.', archetype: ['Wildness', 'Grappling', 'Mobility'], image: '/characters/eli-jang.jpg', variants: [primaryVariant('eli-jang', ['Ryuji-Kenichi', 'Dio-Senko', 'Doku-Tengoku', 'Azarashi'], ['Gale', 'Earth'], 'Ryuji-Kenichi', 'Mixed Martial Arts', 'Baton')] },
  { id: 'zack-lee', name: 'Zack Lee', version: 'Iron Fortress', description: 'Boxing pressure and durability with a reviewed speed-and-counter supporting set.', archetype: ['Iron Fortress', 'Boxing', 'Counter'], image: '/characters/zack-lee.jpg', variants: [primaryVariant('zack-lee', ['Ryuji-Kenichi', 'Bruce-Kenichi', 'Dio-Senko', 'Doku-Tengoku'], ['Lightning', 'Earth'], 'Ryuji-Kenichi', 'Boxing')] },
]

export const curatedBuilds = entries.map(curatedBuild)
