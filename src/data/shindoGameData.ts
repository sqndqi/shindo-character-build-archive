import {
  SHINDO_GAME_VERSION,
  type EvidenceRecord,
  type ShindoItemRecord,
  type ShindoMoveRecord,
  type ShindoSourceRecord,
} from '../types/shindoGame'

const checkedAt = '2026-07-29'

const robloxListing: EvidenceRecord = {
  id: 'evidence-roblox-shindo-listing',
  sourceType: 'Roblox Listing',
  sourceTitle: 'Shindo Life',
  sourceReference: 'https://www.roblox.com/games/4616652839/Shindo-Life',
  revisionOrDate: 'Checked 2026-07-29',
  checkedAt,
  claim: 'Identifies the current public Shindo Life game listing. It does not prove an individual move mechanic.',
  confidence: 'Medium',
  conflictNotes: 'The public listing does not expose enough detail to confirm move placement, cooldowns, or guard behavior.',
}

function wikiEvidence(sourceName: string, claim: string): EvidenceRecord {
  return {
    id: `evidence-wiki-${slug(sourceName)}-${slug(claim).slice(0, 28)}`,
    sourceType: 'Community Wiki',
    sourceTitle: `${sourceName} — Shindo Life Wiki`,
    sourceReference: `https://shindo-life-rell.fandom.com/wiki/${encodeURIComponent(sourceName.replaceAll(' ', '_'))}`,
    revisionOrDate: 'Current page checked 2026-07-29; revision pin pending',
    checkedAt,
    claim,
    confidence: 'Medium',
    conflictNotes: 'A single community-wiki page is not sufficient evidence for current placement or combat-mechanic claims.',
  }
}

type SourceSeed = {
  name: string
  type: ShindoSourceRecord['type']
  moves: string[]
  family?: string
  base?: string
  modeSlot?: 'C' | 'Z' | 'None'
}

const sourceSeeds: SourceSeed[] = [
  { name: 'Aizden', type: 'Bloodline', moves: ['Tyn Art: Reign Dawn', 'Tyn Art: Vlad'], modeSlot: 'C' },
  { name: 'Akuma', type: 'Bloodline', moves: ['Copy Style: Blaze Invert', 'Copy Style: Reality Control', 'Copy Style: Reflex Enhance'], family: 'Akuma', modeSlot: 'C' },
  { name: 'Ashura-Shizen', type: 'Bloodline', moves: ['Wood Style: Golden Dragon', 'Wood Style: Golden Strike', 'Wood Style: Heavenly Barrage'], family: 'Shizen', modeSlot: 'C' },
  { name: 'Azarashi', type: 'Bloodline', moves: ['Chain Style: Chain Chi Drain', 'Chain Style: Chains Of Guard', 'Chain Style: Unchained'], modeSlot: 'C' },
  { name: 'Bankai-Akuma', type: 'Bloodline', moves: ['Copy Style: Fire Blaze', 'Copy Style: Hawk Illusion', 'Illusion Style: Tsukuyomi'], family: 'Akuma', base: 'Akuma', modeSlot: 'C' },
  { name: 'Borumaki', type: 'Bloodline', moves: ['Borumaki Style: Portal Spirit Bomb Shock', 'Borumaki Style: Space Warp'], family: 'Borumaki', modeSlot: 'C' },
  { name: 'Borumaki-Gaiden', type: 'Bloodline', moves: ['Maki Style: Massive Counter Rasen', 'Maki Style: Pistol Rasen'], family: 'Borumaki', base: 'Borumaki', modeSlot: 'C' },
  { name: 'Bruce-Kenichi', type: 'Bloodline', moves: ['Fist Style: 6th Dance', 'Fist Style: 9th Dance', 'Fist Style: Tiger Lotus'], family: 'Kenichi', modeSlot: 'C' },
  { name: 'Dio-Senko', type: 'Bloodline', moves: ['Ultimate Flash', 'Time Style: Time Jump', 'Time Style: Time Stop'], family: 'Dio-Senko', modeSlot: 'C' },
  { name: 'Dio-Senko-Rose', type: 'Bloodline', moves: ['Time Style: Ultimate Flash', 'Time Style: Time Jump', 'Time Style: Time Stop'], family: 'Dio-Senko', base: 'Dio-Senko', modeSlot: 'C' },
  { name: 'Doku-Tengoku', type: 'Bloodline', moves: ['Tengoku Style: 128 Palm Counter', 'Tengoku Style: Concentrated Palm Blast', 'Tengoku Style: Twin Dragon Barrage'], family: 'Tengoku', modeSlot: 'C' },
  { name: 'Doom-Shado', type: 'Bloodline', moves: ['Gadget Style: Grappling Combo', 'Gadget Style: Smoke Bomb'], modeSlot: 'C' },
  { name: 'Getsuga-Black', type: 'Bloodline', moves: ['Kor Style: Getsuga Shuriken Blitz', 'Kor Style: Hand of Getsuga', 'Kor Style: Rasensuga'], family: 'Getsuga', modeSlot: 'C' },
  { name: 'Indra-Akuma', type: 'Bloodline', moves: ['Copy Style: Blades of Destiny', 'Copy Style: Inferno Blaze'], family: 'Akuma', base: 'Akuma', modeSlot: 'C' },
  { name: 'Jotaro-Shizen', type: 'Bloodline', moves: ['Wood Style: Golem Vanishing Images', 'Wood Style: Worlding Invincible'], family: 'Shizen', modeSlot: 'C' },
  { name: 'Kenichi', type: 'Bloodline', moves: ['Fist Style: Crane Demon', 'Fist Style: Dragon Strike', 'Fist Style: Ultimate Tempo'], family: 'Kenichi', modeSlot: 'C' },
  { name: 'Minakaze', type: 'Bloodline', moves: ['Minakaze Style: Kunai Raijin', 'Minakaze Style: Sunsengan Barrage'], family: 'Minakaze', modeSlot: 'C' },
  { name: 'Minakaze-Azure', type: 'Bloodline', moves: ['Minakaze Style: Kunai Raijin', 'Minakaze Style: Sunsengan Barrage', 'Minakaze Style: Sunsengan Overdrive'], family: 'Minakaze', base: 'Minakaze', modeSlot: 'C' },
  { name: 'Narumaki', type: 'Bloodline', moves: ['Narumaki Style: Spirit Bomb Barrage', 'Narumaki Style: Spirit Bomb Cutter', 'Narumaki Style: Time Jump Bomb'], family: 'Narumaki', modeSlot: 'C' },
  { name: 'Pika-Senko', type: 'Bloodline', moves: ['Time Style: Star Kick', 'Time Style: Star Kick Rising'], family: 'Senko', modeSlot: 'C' },
  { name: 'Raion-Akuma', type: 'Bloodline', moves: ['Copy Style: Arrow Blaze', 'Copy Style: Lightning Blaze'], family: 'Raion', modeSlot: 'C' },
  { name: 'Raion-Gaiden', type: 'Bloodline', moves: ['Rengoku Style: Meteor Inferno Blade', 'Rengoku Style: Samurai Combo'], family: 'Raion', modeSlot: 'C' },
  { name: 'Raion-Rengoku', type: 'Bloodline', moves: ['Rengoku Style: Inferno Engage', 'Rengoku Style: Vanishing Replacement'], family: 'Raion', modeSlot: 'C' },
  { name: 'Rengoku', type: 'Bloodline', moves: ['Rengoku Style: Gravity Pull', 'Rengoku Style: Gravity Push'], modeSlot: 'C' },
  { name: 'Riser-Akuma', type: 'Bloodline', moves: ['Copy Style: Hawk Illusion', 'Copy Style: Pain'], family: 'Akuma', base: 'Akuma', modeSlot: 'C' },
  { name: 'Ryuji-Kenichi', type: 'Bloodline', moves: ['Fist Style: 3rd Stance', 'Fist Style: Dragon Demon Combo', 'Fist Style: Dragon Lotus'], family: 'Kenichi', modeSlot: 'C' },
  { name: 'Senko', type: 'Bloodline', moves: ['Senko: Spirit Bomb', 'Senko: Storm'], family: 'Senko', modeSlot: 'C' },
  { name: 'Shindai-Akuma', type: 'Bloodline', moves: ['Copy Style: Samurai Sekiro', 'Copy Style: Sunlight Devastation'], family: 'Akuma', base: 'Akuma', modeSlot: 'C' },
  { name: 'Shindai-Rengoku', type: 'Bloodline', moves: ['Rengoku Style: Tailed Spirit Counter', 'Rengoku Style: Under The Sun'], modeSlot: 'C' },
  { name: 'Shiver-Akuma', type: 'Bloodline', moves: ['Reality Style: Control', 'Reality Style: Dimension', 'Reality Style: Warp'], family: 'Akuma', base: 'Akuma', modeSlot: 'C' },
  { name: 'Shizen', type: 'Bloodline', moves: ['Wood Style: Wooden Bind', 'Wood Style: Worlding Flower'], family: 'Shizen', modeSlot: 'C' },
  { name: 'Six-Paths-Narumaki', type: 'Bloodline', moves: ['Six Path: Spirit Bomb Air Combo', 'Six Path: Spirit Shuriken Barrage'], family: 'Narumaki', modeSlot: 'C' },
  { name: 'SnakeMan', type: 'Bloodline', moves: ['Cobra Art: Form 1', 'Cobra Art: Form 3'], modeSlot: 'C' },
  { name: 'Tengoku-Platinum', type: 'Bloodline', moves: ['Tengoku Style: Kami Blade', 'Tengoku Style: Kami Blitz'], family: 'Tengoku', modeSlot: 'C' },
  { name: 'Air', type: 'Element', moves: ['Air Style: Palm Blast', 'Air Style: Vortex', 'Air Style: Wind Cutter'] },
  { name: 'Chaos', type: 'Element', moves: ['Chaos Style: Blade of Light'] },
  { name: 'Earth', type: 'Element', moves: ['Stone Style: Earth Wall', 'Stone Style: Rage Trail'] },
  { name: 'Fire', type: 'Element', moves: ['Flame Style: Dragon Bomb', 'Flame Style: Flame Bullet', 'Flame Style: Grand Flameball', 'Flame Style: Pheonix Rising'] },
  { name: 'Gale', type: 'Element', moves: ['Gale Style: Vortex', 'Gale Style: Wind Shock Slam', 'Gale Style: Windshock'] },
  { name: 'Inferno', type: 'Element', moves: ['Inferno Style: Burnout', 'Inferno Style: Flame Blitz'] },
  { name: 'Lightning', type: 'Element', moves: ['Shock Style: Blast', 'Shock Style: Electro Control', 'Shock Style: Senbon', 'Shock Style: Stream'] },
  { name: 'Order', type: 'Element', moves: ['Order Style: Beam of Light', 'Order Style: Blade of Light', 'Order Style: Bomb of Light', 'Order Style: Gravity of Light', 'Order Style: Grenade of Light'] },
  { name: 'Yang', type: 'Element', moves: ['Light Style: Sword Flash'] },
  { name: 'Aizden', type: 'Mode', moves: ['Aizden — Stage 1'], modeSlot: 'C' },
  { name: 'Akuma', type: 'Mode', moves: ['Akuma — Stage 1'], modeSlot: 'C' },
  { name: 'Bankai-Akuma', type: 'Mode', moves: ['Bankai-Akuma — Stage 1'], modeSlot: 'C' },
  { name: 'Borumaki', type: 'Mode', moves: ['Borumaki — Stage 1'], modeSlot: 'C' },
  { name: 'Borumaki-Gaiden', type: 'Mode', moves: ['Borumaki-Gaiden — Stage 1'], modeSlot: 'C' },
  { name: 'Dio-Senko', type: 'Mode', moves: ['Dio-Senko — Stage 1'], modeSlot: 'C' },
  { name: 'Dio-Senko-Rose', type: 'Mode', moves: ['Dio-Senko-Rose — Stage 1'], modeSlot: 'C' },
  { name: 'Getsuga-Black', type: 'Mode', moves: ['Getsuga-Black — Stage 1'], modeSlot: 'C' },
  { name: 'Jotaro-Shizen', type: 'Mode', moves: ['Jotaro-Shizen — Stage 1'], modeSlot: 'C' },
  { name: 'Kor Tailed Spirit Generation 2', type: 'Mode', moves: ['Kor Tailed Spirit Generation 2'], modeSlot: 'Z' },
  { name: 'Minakaze', type: 'Mode', moves: ['Minakaze — Stage 1'], modeSlot: 'C' },
  { name: 'Narumaki', type: 'Mode', moves: ['Narumaki — Stage 1'], modeSlot: 'C' },
  { name: 'Raion-Akuma', type: 'Mode', moves: ['Raion-Akuma — Stage 1'], modeSlot: 'C' },
  { name: 'Raion-Rengoku', type: 'Mode', moves: ['Raion-Rengoku — Stage 1'], modeSlot: 'C' },
  { name: 'Rengoku', type: 'Mode', moves: ['Rengoku — Stage 1'], modeSlot: 'C' },
  { name: 'Ryuji-Kenichi', type: 'Mode', moves: ['Ryuji-Kenichi — Stage 1'], modeSlot: 'C' },
  { name: 'Shindai-Rengoku', type: 'Mode', moves: ['Shindai-Rengoku — Stage 1'], modeSlot: 'C' },
  { name: 'Six-Paths-Narumaki', type: 'Mode', moves: ['Six-Paths-Narumaki — Stage 1'], modeSlot: 'C' },
  { name: 'SnakeMan', type: 'Mode', moves: ['SnakeMan — Stage 1'], modeSlot: 'C' },
  { name: 'Tyn Tailed Spirit Generation 2', type: 'Mode', moves: ['Tyn Tailed Spirit Generation 2'], modeSlot: 'Z' },
  ...['Boxing Style', 'Boxing', 'Jeet Kune Do', 'Mixed Martial Arts'].map((name): SourceSeed => ({ name, type: 'Combat Art', moves: [`${name} basic action`] })),
  ...['Bankai Blade', 'Baton', 'Executioner Axe', 'Katana', 'Obelisk Chi Blade', 'Raion Blade', 'Senko Kunai', 'Shindai Umpire Fan'].map((name): SourceSeed => ({ name, type: 'Weapon', moves: [`${name} weapon action`] })),
]

function slug(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')
}

function placementFor(seed: SourceSeed): ShindoMoveRecord['placement'] {
  if (seed.type === 'Bloodline') return { category: 'BloodlineRow', allowedKeys: ['V', 'B', 'N'], flexiblePlacement: false, flexibilityEvidence: [] }
  if (seed.type === 'Element') return { category: 'ElementRow', allowedKeys: ['1', '2', '3', '4', '5', 'T'], flexiblePlacement: false, flexibilityEvidence: [] }
  if (seed.type === 'Mode') return { category: seed.modeSlot === 'Z' ? 'ZMode' : 'CMode', allowedKeys: [seed.modeSlot === 'Z' ? 'Z' : 'C'], flexiblePlacement: false, flexibilityEvidence: [] }
  if (seed.type === 'Weapon') return { category: 'WeaponQ', allowedKeys: ['Q'], flexiblePlacement: false, flexibilityEvidence: [] }
  return { category: 'CombatArtQ', allowedKeys: ['Q'], flexiblePlacement: false, flexibilityEvidence: [] }
}

const unknownMechanics: ShindoMoveRecord['mechanics'] = {
  mobility: 'Unverified',
  autoDodge: 'Unverified',
  counter: 'Unverified',
  iframe: 'Unverified',
  blockBreak: 'Unverified',
  guardPressure: 'Unverified',
  placeLock: 'Unverified',
  stun: 'Unverified',
  ragdoll: 'Unverified',
  knockback: 'Unverified',
  pull: 'Unverified',
  launcher: 'Unverified',
  aerialRequirement: 'Unverified',
  comboStarter: 'Unverified',
  comboExtender: 'Unverified',
  comboFinisher: 'Unverified',
}

export const shindoSources: ShindoSourceRecord[] = sourceSeeds.map((seed) => {
  const evidence = [wikiEvidence(seed.name, `Records the ${seed.type.toLowerCase()} name and its listed abilities.`), robloxListing]
  return {
    id: `${slug(seed.type)}-${slug(seed.name)}`,
    name: seed.name,
    type: seed.type,
    family: seed.family ?? seed.name,
    baseSourceId: seed.base ? `${slug(seed.type)}-${slug(seed.base)}` : null,
    modeSlot: seed.modeSlot ?? 'None',
    movesCanUseElementRow: false,
    modeChangesM1: 'Unverified',
    modeChangesQ: 'Unverified',
    createsWeapon: 'Unverified',
    changesAvatar: 'Unverified',
    moveIds: seed.moves.map((move) => `move-${slug(seed.type)}-${slug(seed.name)}-${slug(move)}`),
    evidence,
  }
})

export const shindoMoves: ShindoMoveRecord[] = sourceSeeds.flatMap((seed) => seed.moves.map((name, index) => ({
  id: `move-${slug(seed.type)}-${slug(seed.name)}-${slug(name)}`,
  name,
  sourceId: `${slug(seed.type)}-${slug(seed.name)}`,
  sourceName: seed.name,
  sourceType: seed.type,
  moveIndex: seed.type === 'Bloodline' && index < 3 ? (index + 1) as 1 | 2 | 3 : undefined,
  gameVersion: SHINDO_GAME_VERSION,
  placement: placementFor(seed),
  mechanics: { ...unknownMechanics },
  requirements: {
    modeRequired: null,
    weaponRequired: seed.type === 'Weapon' ? seed.name : null,
    airborneRequired: 'Unverified',
  },
  resource: { chi: 'Unverified', stamina: 'Unverified', modeDrain: 'Unverified', cooldownSeconds: 'Unverified' },
  evidence: [wikiEvidence(seed.name, `Lists ${name} under ${seed.name}; current combat properties still need independent confirmation.`), robloxListing],
  status: 'Unverified' as const,
})))

const bruceSixth = shindoMoves.find((move) => move.name === 'Fist Style: 6th Dance')
if (bruceSixth) {
  bruceSixth.evidence.push({
    ...wikiEvidence('Game Mechanics', 'Describes 6th Dance as creating an aerial combo state.'),
    id: 'evidence-game-mechanics-sixth-dance',
    sourceReference: 'https://shindo-life-rell.fandom.com/wiki/Game_Mechanics',
  })
}

const bruceNinth = shindoMoves.find((move) => move.name === 'Fist Style: 9th Dance')
if (bruceNinth) {
  bruceNinth.evidence.push({
    ...wikiEvidence('Game Mechanics', 'Describes 9th Dance as an aerial-combo technique outside its mode.'),
    id: 'evidence-game-mechanics-ninth-dance',
    sourceReference: 'https://shindo-life-rell.fandom.com/wiki/Game_Mechanics',
  })
}

export const shindoMoveById = new Map(shindoMoves.map((move) => [move.id, move]))
export const shindoMoveBySourceAndName = new Map(shindoMoves.map((move) => [`${move.sourceName}\u0000${move.name}`, move]))
export const shindoSourceByName = new Map(shindoSources.map((source) => [`${source.type}\u0000${source.name}`, source]))

export function findShindoMove(sourceName: string, moveName: string) {
  return shindoMoveBySourceAndName.get(`${sourceName}\u0000${moveName}`)
}

const itemSeeds: [ShindoItemRecord['type'], string[]][] = [
  ['Combat Art', ['Boxing', 'Boxing Style', 'Jeet Kune Do', 'Mixed Martial Arts']],
  ['Kenjutsu', ['Moon-Kenjutsu', 'Shiver-Kenjutsu', 'Thunder-Kenjutsu', 'Wind-Kenjutsu']],
  ['Weapon', ['Bankai Blade', 'Baton', 'Executioner Axe', 'Katana', 'Obelisk Chi Blade', 'Raion Blade', 'Senko Kunai', 'Shindai Umpire Fan']],
  ['Ninja Tool', []],
  ['Consumable', []],
  ['Mentor', []],
  ['Race', []],
]

export const shindoItems: ShindoItemRecord[] = itemSeeds.flatMap(([type, names]) => names.map((name) => ({
  id: `${slug(type)}-${slug(name)}`,
  name,
  type,
  gameVersion: SHINDO_GAME_VERSION,
  evidence: [wikiEvidence(name, `Records ${name} as a Shindo Life ${type.toLowerCase()}.`), robloxListing],
  status: 'Unverified' as const,
})))
