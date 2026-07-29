import type { CharacterBuild, HotbarSlot } from '../types'

const keys = ['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q']

type Seed = {
  id: string
  name: string
  series: string
  version: string
  description: string
  archetype: string[]
  bloodlines: string[]
  elements: string[]
  cMode?: string
  zMode?: string
  combatArt: string
  weapon?: string
  ratings: [number, number, number, number, number, number, number]
  status?: CharacterBuild['status']
}

const abilityNames: Record<string, string[]> = {
  'Dio-Senko-Rose': ['Rose Flash', 'Time Stop Counter', 'Crimson Overdrive'],
  'Bruce-Kenichi': ['Dragon Heel', 'Axe Kick Barrage', 'Bruce Combo'],
  'Ryuji-Kenichi': ['Ryuji Slam', 'Iron Counter', 'Dragon Pressure'],
  'Doku-Tengoku': ['Venom Counter', 'Tengoku Pull', 'Reactive Guard'],
  'Pika-Senko': ['Pika Flash', 'Light Kick', 'Photon Rush'],
  Akuma: ['Reflex Genjutsu', 'Eye Counter', 'Warrior Guard'],
  'Doom-Shado': ['Shadow Vanish', 'Shade Army', 'Doom Descent'],
  'Raion-Gaiden': ['Raion Burst', 'Black Lightning', 'Gaiden Spear'],
  'Tetsuo-Kaijin': ['Staff Cyclone', 'Kaijin Impact', 'Tetsuo Shift'],
}

function hotbarFor(seed: Seed): HotbarSlot[] {
  const sources = [...seed.bloodlines, ...seed.elements, 'Sub-Ability']
  return keys.map((key, index) => {
    const source = sources[index % sources.length]
    const pool = abilityNames[source] ?? [`${source} Breaker`, `${source} Drive`, `${source} Counter`]
    const role = ['Opener', 'Extender', 'Launcher', 'Pressure', 'Counter', 'Finisher'][index % 6]
    return {
      key,
      ability: key === 'C' ? `${seed.cMode ?? seed.bloodlines[0]} Mode` : key === 'Z' ? `${seed.zMode ?? 'Mobility'} Mode` : key === 'Q' ? `${seed.weapon ?? 'Perfect Guard'} Technique` : pool[index % pool.length],
      source: key === 'C' ? 'C-Mode' : key === 'Z' ? 'Z-Mode' : key === 'Q' ? (seed.weapon ?? 'Combat Art') : source,
      purpose: index % 4 === 0 ? 'Catch movement and begin pressure.' : index % 4 === 1 ? 'Hold the target for the next input.' : index % 4 === 2 ? 'Punish guard or a missed attack.' : 'Convert damage and reset spacing.',
      comboRole: role,
      blockBreak: index === 2 || index === 7 || key === 'Q',
      usageNotes: index % 3 === 0 ? 'Medium Chi; avoid throwing raw.' : index % 3 === 1 ? 'Low stamina; safe after hit confirm.' : 'High Chi; reserve for confirmed routes.',
    }
  })
}

function makeBuild(seed: Seed): CharacterBuild {
  const [accuracy, pvp, mobility, combos, defense, visuals, difficulty] = seed.ratings
  const purpose = ['Core identity', 'Combo routing', 'Mobility / pressure', 'Counter / utility']
  return {
    ...seed,
    image: `/characters/${seed.id}.jpg`,
    bloodlines: seed.bloodlines.map((name, index) => ({ name, purpose: purpose[index], useMode: name === (seed.cMode ?? seed.bloodlines[0]) })),
    cMode: seed.cMode ?? seed.bloodlines[0],
    zMode: seed.zMode ?? 'Demon Gate Spirit',
    weapon: seed.weapon ?? 'None',
    ninjaTool: seed.weapon && seed.weapon !== 'None' ? 'Health Stim' : 'Shock Bomb',
    consumable: 'Chi Stim',
    mentor: seed.combatArt.includes('Box') ? 'Ryuji Mentor' : 'Bruce Mentor',
    race: seed.archetype.includes('Shadow') ? 'Celestial' : 'Human',
    hotbar: hotbarFor(seed),
    combos: [
      { name: 'Main combo', sequence: ['Q', '1', 'V', '2', 'B', '4'], explanation: 'Weapon or art confirm into the primary control route, then cash out before the target can recover.' },
      { name: 'Counter combo', sequence: ['T', '3', 'N', '5'], explanation: 'Absorb or evade the approach, punish the recovery window, and finish from close range.' },
      { name: 'Block-break combo', sequence: ['3', 'Q', 'V', 'B'], explanation: 'Layer two guard threats; continue only when the first hit confirms.' },
      { name: 'Mode combo', sequence: ['C', 'Z', '1', '2', '5'], explanation: 'Activate both engines from safe spacing, then use the mode buffs to extend the route.' },
      { name: 'Escape / reversal', sequence: ['T', 'Z', 'N'], explanation: 'Reverse pressure, create distance, and cover the landing with a ranged check.' },
    ],
    strengths: ['Clear character identity', 'Flexible pressure routes', seed.ratings[2] >= 8 ? 'Elite movement and chase' : 'Reliable neutral tools'],
    weaknesses: [difficulty >= 8 ? 'Strict timing and resource management' : 'Predictable when overextended', defense <= 6 ? 'Limited defensive margin' : 'Mode-dependent defense'],
    substitutions: [`${seed.bloodlines[0]} → a comparable mobility or pressure Bloodline`, `${seed.elements[0]} → Fire for a simpler block-break`],
    ratings: { accuracy, pvp, mobility, combos, defense, visuals, difficulty },
    slotAlternatives: {
      twoSlots: seed.bloodlines.slice(0, 2),
      threeSlots: seed.bloodlines.slice(0, 3),
      fourSlots: seed.bloodlines.slice(0, 4),
    },
    variations: {
      beginner: `Keep ${seed.bloodlines.slice(0, 2).join(' + ')} and replace advanced counters with direct damage.`,
      meta: `Prioritize ${seed.bloodlines[0]} mode and the safest current guard-break tool.`,
      lore: `Keep the listed combat art and ${seed.weapon ?? 'unarmed pressure'} even when a stronger option exists.`,
    },
    notes: `${seed.cMode ?? seed.bloodlines[0]} is the build's main identity. Balance patches may change exact move value.`,
    status: seed.status ?? 'Complete',
  }
}

const seeds: Seed[] = [
  { id: 'james-lee', name: 'James Lee', series: 'Lookism', version: 'Current — Explosive Path', description: 'A frictionless speed-and-technique build that turns evasive movement into sudden explosive kick confirms.', archetype: ['Speed', 'Technique', 'Counter'], bloodlines: ['Dio-Senko-Rose', 'Bruce-Kenichi', 'Pika-Senko', 'Doku-Tengoku'], elements: ['Gale', 'Order'], cMode: 'Dio-Senko-Rose', zMode: 'Shock Cloak', combatArt: 'Jeet Kune Do', ratings: [9.4, 9.1, 9.8, 9.2, 7.4, 9.7, 8.7] },
  { id: 'seongji-yuk', name: 'Seongji Yuk', series: 'Lookism', version: 'Cheonliang — Three Thresholds', description: 'Heavy grappling and threshold-breaking power backed by surprising burst movement.', archetype: ['Power', 'Toughness', 'Speed', 'Grappling'], bloodlines: ['Ryuji-Kenichi', 'Dio-Senko-Rose', 'Bruce-Kenichi', 'Doku-Tengoku'], elements: ['Earth', 'Gale'], combatArt: 'Mixed Martial Arts', ratings: [9.2, 9.3, 8.5, 9.1, 9.2, 9.1, 8.4] },
  { id: 'gun-park', name: 'Gun Park', series: 'Lookism', version: 'Mastered Ultra Instinct', description: 'Relentless close-range pressure, automatic reactions, and endurance that rewards calculated aggression.', archetype: ['UI', 'Pressure', 'Durability'], bloodlines: ['Akuma', 'Bruce-Kenichi', 'Ryuji-Kenichi', 'Doku-Tengoku'], elements: ['Earth', 'Order'], cMode: 'Akuma', combatArt: 'Mixed Martial Arts', ratings: [9.1, 9.5, 8.1, 9.3, 9.7, 9.3, 8.9] },
  { id: 'little-daniel-park', name: 'Little Daniel Park', series: 'Lookism', version: 'UI and Path', description: 'A prediction-led copy build that changes rhythm repeatedly and converts mistakes into complete routes.', archetype: ['Copy', 'Prediction', 'Counter'], bloodlines: ['Akuma', 'Dio-Senko-Rose', 'Bruce-Kenichi', 'Doku-Tengoku'], elements: ['Order', 'Gale'], cMode: 'Akuma', combatArt: 'Mixed Martial Arts', ratings: [8.8, 9.0, 8.9, 9.6, 8.0, 8.9, 9.2] },
  { id: 'johan-seong', name: 'Johan Seong', series: 'Lookism', version: 'Infinite Technique', description: 'A volatile copy loadout with extreme tempo changes and a dense library of martial routes.', archetype: ['Copy', 'Speed', 'Technique'], bloodlines: ['Bruce-Kenichi', 'Dio-Senko-Rose', 'Pika-Senko', 'Doku-Tengoku'], elements: ['Gale', 'Lightning'], combatArt: 'Mixed Martial Arts', ratings: [9.0, 9.2, 9.4, 9.8, 6.9, 9.2, 9.5] },
  { id: 'kitae-kim', name: 'Kitae Kim', series: 'Lookism', version: 'King of Seoul', description: 'Brutal forward momentum, oppressive physical damage, and an axe option for savage finishers.', archetype: ['Power', 'Brutality', 'Endurance'], bloodlines: ['Ryuji-Kenichi', 'Demon-Gate', 'Minakaze-Azure', 'Doku-Tengoku'], elements: ['Earth', 'Fire'], combatArt: 'Mixed Martial Arts', weapon: 'Executioner Axe', ratings: [8.4, 9.1, 7.2, 8.4, 9.3, 8.8, 7.8] },
  { id: 'goo-kim', name: 'Goo Kim', series: 'Lookism', version: 'Weapon Genius', description: 'Improvised sword mastery with awkward timings, fast punishes, and deliberately unstable pressure.', archetype: ['Weapon', 'Technique', 'Unpredictability'], bloodlines: ['Kenichi', 'Shindai-Rengoku', 'Getsuga-Black', 'Doku-Tengoku'], elements: ['Lightning', 'Order'], cMode: 'Shindai-Rengoku', combatArt: 'Kenjutsu', weapon: 'Chi Blade', ratings: [8.9, 8.8, 8.2, 9.2, 7.0, 9.4, 8.8] },
  { id: 'jake-kim', name: 'Jake Kim', series: 'Lookism', version: 'Conviction', description: 'A durable leader build that wins exchanges with conviction spikes and disciplined counters.', archetype: ['Power', 'Leadership', 'Defense'], bloodlines: ['Ryuji-Kenichi', 'Doku-Tengoku', 'Bruce-Kenichi', 'Minakaze'], elements: ['Earth', 'Order'], combatArt: 'Mixed Martial Arts', ratings: [8.7, 8.9, 7.5, 8.6, 9.1, 8.3, 7.4] },
  { id: 'eli-jang', name: 'Eli Jang', series: 'Lookism', version: 'Wildness', description: 'Unorthodox grappling, animalistic angles, and improvised weapons create a slippery chase build.', archetype: ['Wildness', 'Grappling', 'Mobility'], bloodlines: ['Ryuji-Kenichi', 'Dio-Senko', 'Doku-Tengoku', 'Azarashi'], elements: ['Gale', 'Earth'], combatArt: 'Mixed Martial Arts', weapon: 'Baton', ratings: [8.6, 8.7, 9.0, 8.8, 7.8, 8.7, 8.1] },
  { id: 'zack-lee', name: 'Zack Lee', series: 'Lookism', version: 'Iron Fortress', description: 'Compact boxing pressure built around iron durability, clean footwork, and hard counter hooks.', archetype: ['Boxing', 'Defense', 'Speed'], bloodlines: ['Ryuji-Kenichi', 'Bruce-Kenichi', 'Dio-Senko', 'Doku-Tengoku'], elements: ['Lightning', 'Earth'], combatArt: 'Boxing', ratings: [9.0, 8.8, 8.7, 8.4, 9.4, 8.5, 7.7] },
  { id: 'jin-mori', name: 'Jin Mori', series: 'The God of High School', version: 'Monkey King Awakened', description: 'Staff rotations and renewal kicks escalate into a lightning-charged Monkey King transformation.', archetype: ['Staff', 'Martial Arts', 'Transformation'], bloodlines: ['Tetsuo-Kaijin', 'Raion-Gaiden', 'Bruce-Kenichi', 'Dio-Senko'], elements: ['Lightning', 'Air'], cMode: 'Tetsuo-Kaijin', zMode: 'Kor Tailed Spirit', combatArt: 'Jeet Kune Do', weapon: 'Enra Staff', ratings: [9.0, 9.4, 9.5, 9.3, 8.6, 9.8, 8.6] },
  { id: 'han-daewi', name: 'Han Daewi', series: 'The God of High School', version: 'Sage of the East', description: 'Measured karate controls gravity and natural forces before releasing overwhelming area damage.', archetype: ['Karate', 'Gravity', 'Control'], bloodlines: ['Doku-Tengoku', 'Tengoku-Platinum', 'Rengoku', 'Ryuji-Kenichi'], elements: ['Earth', 'Water'], cMode: 'Tengoku-Platinum', combatArt: 'Karate', ratings: [8.8, 9.0, 7.1, 8.9, 9.2, 9.4, 8.5] },
  { id: 'sung-jinwoo', name: 'Sung Jinwoo', series: 'Solo Leveling', version: 'Shadow Monarch', description: 'Shadow teleports and summons swarm neutral while dual daggers convert every opening.', archetype: ['Shadow', 'Summoner', 'Assassin'], bloodlines: ['Doom-Shado', 'Shado', 'Minakaze-Azure', 'Getsuga-Black'], elements: ['Fire', 'Lightning'], cMode: 'Doom-Shado', zMode: 'Maru Daggers', combatArt: 'Tanto Arts', weapon: 'Dual Daggers', ratings: [9.3, 9.4, 9.3, 9.2, 8.4, 9.9, 8.7] },
  { id: 'cheon-yeo-woon', name: 'Cheon Yeo-Woon', series: 'Nano Machine', version: 'Heavenly Demon', description: 'Nano-assisted precision and dark sword pressure are wrapped in a ruthless demonic aura.', archetype: ['Sword', 'Precision', 'Demon'], bloodlines: ['Getsuga-Black', 'Doku-Tengoku', 'Shindai-Rengoku', 'Bruce-Kenichi'], elements: ['Order', 'Fire'], cMode: 'Getsuga-Black', combatArt: 'Kenjutsu', weapon: 'Demon Blade', ratings: [8.9, 9.1, 8.3, 9.3, 8.2, 9.7, 8.8] },
  { id: 'jin-mu-won', name: 'Jin Mu-Won', series: 'Legend of the Northern Blade', version: 'Northern Heavenly Sect', description: 'A restrained black-katana build that layers shadow movement with decisive sword arcs.', archetype: ['Shadow', 'Sword', 'Discipline'], bloodlines: ['Doom-Shado', 'Getsuga-Black', 'Shindai-Rengoku', 'Doku-Tengoku'], elements: ['Wind', 'Order'], cMode: 'Doom-Shado', combatArt: 'Kenjutsu', weapon: 'Black Katana', ratings: [9.1, 9.0, 8.4, 8.9, 8.7, 9.8, 8.2] },
  { id: 'kayden-break', name: 'Kayden Break', series: 'Eleceed', version: 'Top Ten Awakener', description: 'Explosive lightning artillery paired with instantaneous movement and punishing ranged control.', archetype: ['Lightning', 'Speed', 'Destruction'], bloodlines: ['Raion-Gaiden', 'Raion-Akuma', 'Dio-Senko', 'Tengoku-Platinum'], elements: ['Lightning', 'Air'], cMode: 'Raion-Gaiden', zMode: 'Lightning Cloak', combatArt: 'Jeet Kune Do', ratings: [9.0, 9.3, 9.7, 8.7, 7.2, 9.8, 8.4] },
  { id: 'yu', name: 'Yu', series: 'The Boxer', version: 'Prime Lightweight', description: 'Almost no wasted movement: prediction, clean dodges, and single-hit boxing punish every commitment.', archetype: ['Boxing', 'Prediction', 'Minimalism'], bloodlines: ['Doku-Tengoku', 'Bruce-Kenichi', 'Dio-Senko', 'Akuma'], elements: ['Air', 'Order'], cMode: 'Dio-Senko', combatArt: 'Boxing', ratings: [9.6, 8.6, 9.1, 7.9, 8.0, 7.7, 9.0] },
  { id: 'barolt', name: 'Barolt', series: 'Latna Saga', version: 'Sword King', description: 'Extreme physical strength and Demon Gate endurance turn simple hits into raid-boss pressure.', archetype: ['Power', 'Durability', 'Berserker'], bloodlines: ['Ryuji-Kenichi', 'Demon-Gate', 'Bruce-Kenichi', 'Doku-Tengoku'], elements: ['Earth', 'Fire'], cMode: 'Demon-Gate', combatArt: 'Mixed Martial Arts', weapon: 'Greatsword', ratings: [8.8, 9.5, 6.8, 8.3, 9.9, 9.5, 7.6] },
  { id: 'arthur-leywin', name: 'Arthur Leywin', series: 'The Beginning After the End', version: 'Realmheart', description: 'A technical elemental swordsman that adapts range, controls tempo, and invokes draconic power.', archetype: ['Elements', 'Sword', 'Dragon'], bloodlines: ['Tengoku-Platinum', 'Raion-Gaiden', 'Getsuga-Black', 'Dio-Senko'], elements: ['Fire', 'Water'], cMode: 'Tengoku-Platinum', zMode: 'Dragon Sage', combatArt: 'Kenjutsu', weapon: 'Dawn Sword', ratings: [8.9, 9.2, 9.0, 9.4, 8.3, 9.9, 9.3] },
  { id: 'gray-yeon', name: 'Gray Yeon', series: 'Weak Hero', version: 'Eunjang Strategist', description: 'A deliberately low-effects tactical build using prediction, traps, and improvised tools.', archetype: ['Prediction', 'Traps', 'Counter'], bloodlines: ['Doku-Tengoku', 'Akuma', 'Minakaze', 'Shiver-Akuma'], elements: ['Order', 'Earth'], cMode: 'Akuma', combatArt: 'Boxing', weapon: 'Improvised Pen', ratings: [9.2, 7.9, 7.4, 8.5, 6.8, 7.4, 8.9], status: 'Needs Testing' },
]

export const originalCharacters: CharacterBuild[] = seeds.map(makeBuild)

export function createBlankBuild(): CharacterBuild {
  const base = structuredClone(originalCharacters[0])
  const id = `custom-${Date.now()}`
  return {
    ...base,
    id,
    name: 'Untitled Fighter',
    series: 'Custom',
    version: 'Original Build',
    image: `/characters/${id}.jpg`,
    description: 'Describe how this fighter approaches pressure, movement, and defense.',
    archetype: ['Custom'],
    status: 'Draft',
    notes: 'New local build.',
  }
}
