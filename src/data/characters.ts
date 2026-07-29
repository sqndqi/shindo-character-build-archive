import type { CharacterBuild, HotbarSlot } from '../types'
import { createPermanentId } from '../lib/identity'

const keys = ['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q']
const missingPortraitIds = new Set(['jinhyeok-murim', 'lee-gwak', 'vikir', 'seo-gangrim', 'lucas-traumen', 'rania', 'karsia', 'yi-zaha'])

type Seed = {
  id: string
  name: string
  series: string
  franchise?: string
  version: string
  description: string
  archetype: string[]
  combatTags?: string[]
  effectsIntensity?: CharacterBuild['effectsIntensity']
  bloodlines: string[]
  elements: string[]
  cMode?: string
  zMode?: string
  combatArt: string
  weapon?: string
  ratings: [number, number, number, number, number, number, number]
  aura?: number
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

function franchiseFor(series: string) {
  if (['Lookism', 'Manager Kim', 'Viral Hit', 'Questism', 'Reality Quest', 'Mercenary Enrollment'].includes(series)) return 'PTJ / Street Action'
  if (['Nano Machine', 'Myst, Might, Mayhem', 'Return of the Mount Hua Sect', 'Murim Login', 'Martial Artist Lee Gwak', 'Volcanic Age', 'Return of the Mad Demon'].includes(series)) return 'Murim'
  if (['Legend of the Northern Blade', 'Gosu'].includes(series)) return 'Northern Blade / Gosu'
  if (['The Beginning After the End', 'Doom Breaker', 'Revenge of the Iron-Blooded Sword Hound'].includes(series)) return 'Aura Fantasy'
  return series
}

function hotbarFor(seed: Seed): HotbarSlot[] {
  const sources = [...seed.bloodlines, ...seed.elements, 'Sub-Ability']
  return keys.map((key, index) => {
    const source = sources[index % sources.length]
    const pool = abilityNames[source] ?? [`${source} Breaker`, `${source} Drive`, `${source} Counter`]
    const role = ['Opener', 'Extender', 'Launcher', 'Pressure', 'Counter', 'Finisher'][index % 6]
    return {
      id: `${seed.id}-hotbar-${key}`,
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
  const searchable = [...seed.archetype, seed.combatArt, seed.weapon ?? '', ...seed.bloodlines].join(' ').toLowerCase()
  const combatTags = seed.combatTags ?? [
    !seed.weapon || seed.weapon === 'None' ? 'Hand-to-hand' : '',
    /sword|katana|blade|knight/.test(searchable) ? 'Sword' : '',
    /spear/.test(searchable) ? 'Spear' : '',
    /staff/.test(searchable) ? 'Staff' : '',
    /assassin/.test(searchable) ? 'Assassin' : '',
    /mage|magic|elemental/.test(searchable) ? 'Mage' : '',
    /system/.test(searchable) ? 'System user' : '',
    /copy/.test(searchable) ? 'Copy user' : '',
    /lightning|raion/.test(searchable) ? 'Lightning' : '',
    /shadow|shado|doom/.test(searchable) ? 'Shadow' : '',
    /martial|boxing|karate|kune|muay|cqc|grappl/.test(searchable) ? 'Martial arts' : '',
    /final boss|boss|demon|cosmic/.test(searchable) ? 'Final boss' : '',
  ].filter(Boolean)
  const aura = seed.aura ?? Math.round(((visuals + pvp) / 2) * 10) / 10
  const effectsIntensity = seed.effectsIntensity
    ?? (combatTags.includes('Final boss') || combatTags.includes('Mage') ? 'Ridiculous'
      : combatTags.includes('Lightning') || combatTags.includes('Shadow') ? 'High'
        : visuals < 8 ? 'Low' : 'Medium')
  return {
    ...seed,
    characterId: `character-${seed.id.replace(/-(king-grey|tools|aura)$/, '')}`,
    versionId: `version-${seed.id}`,
    buildName: seed.version,
    franchise: seed.franchise ?? franchiseFor(seed.series),
    combatTags,
    customTags: [],
    effectsIntensity,
    image: missingPortraitIds.has(seed.id) ? '' : `/characters/${seed.id}.jpg`,
    bloodlines: seed.bloodlines.map((name, index) => ({ id: `${seed.id}-bloodline-${index + 1}`, name, purpose: purpose[index], useMode: name === (seed.cMode ?? seed.bloodlines[0]) })),
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
    ratings: { accuracy, pvp, mobility, combos, defense, visuals, aura, difficulty },
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
    gameUpdate: 'Unverified',
    lastVerifiedUpdate: '',
    verificationStatus: 'Needs Retesting',
    createdAt: '2026-07-29T00:00:00.000Z',
    updatedAt: '2026-07-29T00:00:00.000Z',
    testing: { status: 'Untested', contexts: [], tester: '', testDate: '', notes: '' },
    changeHistory: [],
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

type ExtraSpec = {
  id: string
  name: string
  series: string
  version: string
  bloodlines: string[]
  archetype: string[]
  combatArt?: string
  weapon?: string
}

const extraSpecs: ExtraSpec[] = [
  { id: 'tom-lee', name: 'Tom Lee', series: 'Lookism', version: 'Ultimate King', bloodlines: ['Ryuji-Kenichi', 'Bruce-Kenichi', 'Minakaze'], archetype: ['Strength', 'Instinct', 'Grappling'], combatArt: 'Mixed Martial Arts' },
  { id: 'gapryong-kim', name: 'Gapryong Kim', series: 'Lookism', version: 'Conviction', bloodlines: ['Ryuji-Kenichi', 'Ashura-Shizen', 'Bruce-Kenichi'], archetype: ['Conviction', 'Power', 'Durability'], combatArt: 'Boxing' },
  { id: 'jinyoung-park', name: 'Jinyoung Park', series: 'Lookism', version: 'Copy Genius', bloodlines: ['Doku-Tengoku', 'Bruce-Kenichi', 'Dio-Senko-Rose', 'Ryuji-Kenichi'], archetype: ['Copy', 'Intelligence', 'Technique'], combatArt: 'Mixed Martial Arts' },
  { id: 'charles-choi', name: 'Charles Choi', series: 'Lookism', version: 'Elite', bloodlines: ['Dio-Senko-Rose', 'Pika-Senko', 'Doku-Tengoku'], archetype: ['Speed', 'Technique', 'Intelligence'], combatArt: 'Jeet Kune Do' },
  { id: 'shingen-yamazaki', name: 'Shingen Yamazaki', series: 'Lookism', version: 'Yamazaki Head', bloodlines: ['Shindai-Akuma', 'Ryuji-Kenichi', 'Ashura-Shizen'], archetype: ['UI', 'Strength', 'Final Boss'], combatArt: 'Mixed Martial Arts' },
  { id: 'shintaro-yamazaki', name: 'Shintaro Yamazaki', series: 'Lookism', version: 'Controlled UI', bloodlines: ['Raion-Akuma', 'Bruce-Kenichi', 'Ryuji-Kenichi'], archetype: ['UI', 'Technique', 'Discipline'], combatArt: 'Mixed Martial Arts' },
  { id: 'samuel-seo', name: 'Samuel Seo', series: 'Lookism', version: 'Heat Mode', bloodlines: ['Ryuji-Kenichi', 'Xeno-Dokei', 'Bruce-Kenichi'], archetype: ['Heat', 'Brutality', 'Durability'], combatArt: 'Mixed Martial Arts' },
  { id: 'vasco', name: 'Vasco', series: 'Lookism', version: 'Hero of Burn Knuckles', bloodlines: ['Ryuji-Kenichi', 'Bruce-Kenichi', 'Ashura-Shizen'], archetype: ['Strength', 'Muay Thai', 'Hero'], combatArt: 'Muay Thai' },
  { id: 'vin-jin', name: 'Vin Jin', series: 'Lookism', version: 'Cheonliang Kudo', bloodlines: ['Ryuji-Kenichi', 'Doku-Tengoku', 'Minakaze'], archetype: ['Grappling', 'Power', 'Speed'], combatArt: 'Mixed Martial Arts' },
  { id: 'jaegyeon-na', name: 'Jaegyeon Na', series: 'Lookism', version: 'King of Incheon', bloodlines: ['Dio-Senko-Rose', 'Minakaze', 'Pika-Senko'], archetype: ['Speed', 'Mobility', 'Evasion'], combatArt: 'Jeet Kune Do' },
  { id: 'jichang-kwak', name: 'Jichang Kwak', series: 'Lookism', version: 'White Snake', bloodlines: ['Ryuji-Kenichi', 'Doku-Tengoku', 'Bruce-Kenichi'], archetype: ['Precision', 'Power', 'Strategy'], combatArt: 'Karate' },
  { id: 'taesoo-ma', name: 'Taesoo Ma', series: 'Lookism', version: 'One Fist', bloodlines: ['Ryuji-Kenichi', 'Ashura-Shizen'], archetype: ['Power', 'Conviction', 'One-Hit'], combatArt: 'Boxing' },
  { id: 'gongseob-ji', name: 'Gongseob Ji', series: 'Lookism', version: 'Iron Boxer', bloodlines: ['Bruce-Kenichi', 'Ryuji-Kenichi', 'Doku-Tengoku'], archetype: ['Defense', 'Boxing', 'Counter'], combatArt: 'Boxing' },
  { id: 'sinu-han', name: 'Sinu Han', series: 'Lookism', version: 'Boy of Promise', bloodlines: ['Dio-Senko-Rose', 'Pika-Senko', 'Bruce-Kenichi'], archetype: ['Speed', 'Technique', 'Pressure'], combatArt: 'Jeet Kune Do' },
  { id: 'warren-chae', name: 'Warren Chae', series: 'Lookism', version: 'New CQC', bloodlines: ['Bruce-Kenichi', 'Doku-Tengoku', 'Ryuji-Kenichi'], archetype: ['CQC', 'Technique', 'Endurance'], combatArt: 'Mixed Martial Arts' },
  { id: 'manager-kim', name: 'Manager Kim', series: 'Manager Kim', version: 'Black Ops Father', bloodlines: ['Doku-Tengoku', 'Minakaze', 'Bruce-Kenichi'], archetype: ['CQC', 'Assassin', 'Tactical'], combatArt: 'Mixed Martial Arts', weapon: 'Dagai Wire' },
  { id: 'hansu-seong', name: 'Hansu Seong', series: 'Manager Kim', version: 'Technique Release', bloodlines: ['Bruce-Kenichi', 'Ryuji-Kenichi', 'Tetsuo-Kaijin'], archetype: ['Kicks', 'Technique', 'Power'], combatArt: 'Jeet Kune Do' },
  { id: 'jincheol-park', name: 'Jincheol Park', series: 'Manager Kim', version: 'War Mode', bloodlines: ['Ryuji-Kenichi', 'Ashura-Shizen', 'Bruce-Kenichi'], archetype: ['Soldier', 'Power', 'Endurance'], combatArt: 'Mixed Martial Arts', weapon: 'Combat Knife' },
  { id: 'hobin-yoo', name: 'Hobin Yoo', series: 'Viral Hit', version: 'How to Fight', bloodlines: ['Bruce-Kenichi', 'Doku-Tengoku', 'Minakaze'], archetype: ['Counter', 'Adaptation', 'Technique'], combatArt: 'Mixed Martial Arts' },
  { id: 'taehoon-seong', name: 'Taehoon Seong', series: 'Viral Hit', version: 'Taekwondo Prodigy', bloodlines: ['Bruce-Kenichi', 'Pika-Senko', 'Dio-Senko-Rose'], archetype: ['Kicks', 'Speed', 'Technique'], combatArt: 'Jeet Kune Do' },
  { id: 'suhyeon-kim', name: 'Suhyeon Kim', series: 'Questism', version: 'Card Master', bloodlines: ['Shindai-Rengoku', 'Dio-Senko-Rose', 'Bruce-Kenichi'], archetype: ['System', 'Copy', 'Versatility'], combatArt: 'Mixed Martial Arts' },
  { id: 'choyun', name: 'Choyun', series: 'Questism', version: 'System Overlord', bloodlines: ['Aizden', 'Shindai-Rengoku', 'Code-Gaiden'], archetype: ['System', 'Control', 'Final Boss'], combatArt: 'Mixed Martial Arts' },
  { id: 'daniel-questism', name: 'Daniel', series: 'Questism', version: 'Northern No. 2', bloodlines: ['Bruce-Kenichi', 'Dio-Senko-Rose', 'Doku-Tengoku'], archetype: ['Speed', 'Technique', 'Strategy'], combatArt: 'Mixed Martial Arts' },
  { id: 'hajun-gu', name: 'Hajun Gu', series: 'Questism', version: 'Overlord', bloodlines: ['Ryuji-Kenichi', 'Bruce-Kenichi'], archetype: ['Strength', 'Pressure', 'Durability'], combatArt: 'Mixed Martial Arts' },
  { id: 'dowan-ha', name: 'Dowan Ha', series: 'Reality Quest', version: 'Reality System', bloodlines: ['Dio-Senko-Rose', 'Bruce-Kenichi', 'Raion-Gaiden'], archetype: ['System', 'Speed', 'Growth'], combatArt: 'Mixed Martial Arts' },
  { id: 'sung-il-hwan', name: 'Sung Il-Hwan', series: 'Solo Leveling', version: 'Ruler Vessel', bloodlines: ['Ashura-Shizen', 'Dio-Senko-Rose', 'Ryuji-Kenichi'], archetype: ['Ruler', 'Strength', 'Speed'], combatArt: 'Mixed Martial Arts' },
  { id: 'thomas-andre', name: 'Thomas Andre', series: 'Solo Leveling', version: 'Goliath', bloodlines: ['Ashura-Shizen', 'Ryuji-Kenichi', 'Apollo-Sand'], archetype: ['Tank', 'Power', 'Destruction'], combatArt: 'Mixed Martial Arts' },
  { id: 'liu-zhigang', name: 'Liu Zhigang', series: 'Solo Leveling', version: 'National Hunter', bloodlines: ['Getsuga-Black', 'Raion-Gaiden', 'Dio-Senko-Rose'], archetype: ['Sword', 'Speed', 'Aura'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'beru', name: 'Beru', series: 'Solo Leveling', version: 'Shadow General', bloodlines: ['Xeno-Dokei', 'Aizden', 'Dio-Senko-Rose'], archetype: ['Monster', 'Speed', 'Regeneration', 'Shadow'], combatArt: 'Claw Arts' },
  { id: 'igris', name: 'Igris', series: 'Solo Leveling', version: 'Blood-Red Commander', bloodlines: ['Bankai-Akuma', 'Getsuga-Black', 'Doom-Shado'], archetype: ['Knight', 'Sword', 'Shadow'], combatArt: 'Kenjutsu', weapon: 'Greatsword' },
  { id: 'kim-dokja', name: 'Kim Dokja', series: 'Omniscient Reader', version: 'Demon King of Salvation', bloodlines: ['Shindai-Rengoku', 'Doku-Tengoku', 'Bankai-Akuma'], archetype: ['Scenario', 'Prediction', 'Control'], combatArt: 'Mixed Martial Arts' },
  { id: 'yoo-joonghyuk', name: 'Yoo Joonghyuk', series: 'Omniscient Reader', version: 'Regressor', bloodlines: ['Getsuga-Black', 'Raion-Akuma', 'Ryuji-Kenichi'], archetype: ['Regression', 'Sword', 'Endurance'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'secretive-plotter', name: 'Secretive Plotter', series: 'Omniscient Reader', version: 'Outer God', bloodlines: ['Aizden', 'Doom-Shado', 'Shindai-Rengoku'], archetype: ['Cosmic', 'Shadow', 'Final Boss'], combatArt: 'Reality Warping' },
  { id: 'kyrgios-rodgraim', name: 'Kyrgios Rodgraim', series: 'Omniscient Reader', version: 'Electrification', bloodlines: ['Bruce-Kenichi', 'Pika-Senko', 'Raion-Gaiden'], archetype: ['Lightning', 'Speed', 'Martial Arts'], combatArt: 'Mixed Martial Arts' },
  { id: 'jiwoo-seo', name: 'Jiwoo Seo', series: 'Eleceed', version: 'Kayden Force Control', bloodlines: ['Raion-Gaiden', 'Dio-Senko-Rose', 'Bruce-Kenichi'], archetype: ['Speed', 'Lightning', 'Close Combat'], combatArt: 'Boxing' },
  { id: 'kartein', name: 'Kartein', series: 'Eleceed', version: 'Divine Healer', bloodlines: ['Light-Jokei', 'Shizen', 'Doku-Tengoku'], archetype: ['Healing', 'Defense', 'Technique'], combatArt: 'Precision Arts' },
  { id: 'andrei', name: 'Andrei', series: 'Eleceed', version: 'World Awakener', bloodlines: ['Raion-Gaiden', 'Aizden', 'Shindai-Rengoku'], archetype: ['Lightning', 'Destruction', 'Boss'], combatArt: 'Force Control' },
  { id: 'blade-god', name: 'Blade God', series: 'Nano Machine', version: 'Space-Cutting Demon', bloodlines: ['Getsuga-Black', 'Bankai-Akuma', 'Kamaki-Akuma'], archetype: ['Sword', 'Demon', 'Precision'], combatArt: 'Kenjutsu', weapon: 'Katana' },
  { id: 'heavenly-demon-mmm', name: 'Heavenly Demon', series: 'Myst, Might, Mayhem', version: 'First Heavenly Demon', bloodlines: ['Aizden', 'Bankai-Akuma', 'Getsuga-Black'], archetype: ['Demon', 'Sword', 'Final Boss'], combatArt: 'Kenjutsu', weapon: 'Demon Sword' },
  { id: 'mok-gyeong-woon', name: 'Mok Gyeong-Woon', series: 'Myst, Might, Mayhem', version: 'Demonic Sovereign', bloodlines: ['Bankai-Akuma', 'Doom-Shado', 'Aizden'], archetype: ['Dark', 'Sword', 'Necromancy'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'chung-myung', name: 'Chung Myung', series: 'Return of the Mount Hua Sect', version: 'Plum Blossom Sword Saint', bloodlines: ['Getsuga', 'Bruce-Kenichi', 'Dio-Senko-Rose'], archetype: ['Sword', 'Speed', 'Technique'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'jinhyeok-murim', name: 'Jinhyeok', series: 'Murim Login', version: 'System Ascendant', bloodlines: ['Bruce-Kenichi', 'Ryuji-Kenichi', 'Dio-Senko-Rose'], archetype: ['System', 'Martial Arts', 'Growth'], combatArt: 'Mixed Martial Arts', weapon: 'Spear' },
  { id: 'jin-tae-kyung', name: 'Jin Tae-Kyung', series: 'Murim Login', version: 'Fire King Disciple', bloodlines: ['Ryuji-Kenichi', 'Bruce-Kenichi', 'Tetsuo-Kaijin'], archetype: ['Spear', 'Power', 'Martial Arts'], combatArt: 'Spear Arts', weapon: 'Spear' },
  { id: 'lee-gwak', name: 'Lee Gwak', series: 'Martial Artist Lee Gwak', version: 'Quiet Master', bloodlines: ['Doom-Shado', 'Bruce-Kenichi', 'Doku-Tengoku'], archetype: ['Technique', 'Shadow', 'Counter'], combatArt: 'Mixed Martial Arts' },
  { id: 'lee-geon', name: 'Lee Geon', series: 'Return of the Disaster-Class Hero', version: 'Serpent Bearer', bloodlines: ['Aizden', 'Shindai-Rengoku', 'Ryuji-Kenichi'], archetype: ['Divine', 'Power', 'Summoner'], combatArt: 'Mixed Martial Arts' },
  { id: 'dam-soo-cheon', name: 'Dam Soo-Cheon', series: 'Legend of the Northern Blade', version: 'Cerulean Dragon', bloodlines: ['Raion-Gaiden', 'Ryuji-Kenichi', 'Bruce-Kenichi'], archetype: ['Spear', 'Lightning', 'Power'], combatArt: 'Spear Arts', weapon: 'Spear' },
  { id: 'jo-cheon-woo', name: 'Jo Cheon-Woo', series: 'Legend of the Northern Blade', version: 'Great Four', bloodlines: ['Ryuji-Kenichi', 'Ashura-Shizen', 'Xeno-Dokei'], archetype: ['Power', 'Tank', 'Brutality'], combatArt: 'Mixed Martial Arts' },
  { id: 'gang-ryong', name: 'Gang Ryong', series: 'Gosu', version: 'Heavenly Destroyer Disciple', bloodlines: ['Ryuji-Kenichi', 'Ashura-Shizen', 'Shindai-Rengoku'], archetype: ['Martial Arts', 'Power', 'Energy'], combatArt: 'Mixed Martial Arts' },
  { id: 'yongbi', name: 'Yongbi', series: 'Gosu', version: 'Veteran Spearmaster', bloodlines: ['Bruce-Kenichi', 'Ryuji-Kenichi', 'Dio-Senko-Rose'], archetype: ['Spear', 'Technique', 'Speed'], combatArt: 'Spear Arts', weapon: 'Spear' },
  { id: 'arthur-leywin-king-grey', name: 'Arthur Leywin', series: 'The Beginning After the End', version: 'King Grey', bloodlines: ['Rykan-Shizen', 'Raion-Gaiden', 'Getsuga-Black', 'Light-Jokei'], archetype: ['Elemental', 'Dragon', 'Sword'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'regis', name: 'Regis', series: 'The Beginning After the End', version: 'Destruction Companion', bloodlines: ['Aizden', 'Doom-Shado', 'Getsuga-Black'], archetype: ['Destruction', 'Shadow', 'Companion'], combatArt: 'Claw Arts' },
  { id: 'agrona-vritra', name: 'Agrona Vritra', series: 'The Beginning After the End', version: 'Vritra Sovereign', bloodlines: ['Aizden', 'Xeno-Dokei', 'Shindai-Rengoku'], archetype: ['Dragon', 'Control', 'Final Boss'], combatArt: 'Aether Arts' },
  { id: 'zephyr', name: 'Zephyr', series: 'Doom Breaker', version: 'Dragon Slayer Regressor', bloodlines: ['Rykan-Shizen', 'Raion-Gaiden', 'Getsuga-Black'], archetype: ['Dragon', 'Sword', 'Regression'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'vikir', name: 'Vikir', series: 'Revenge of the Iron-Blooded Sword Hound', version: 'Iron-Blooded Hound', bloodlines: ['Getsuga-Black', 'Bankai-Akuma', 'Dio-Senko-Rose'], archetype: ['Assassin', 'Sword', 'Revenge'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'cale-henituse', name: 'Cale Henituse', series: 'Trash of the Count’s Family', version: 'Ancient Powers', bloodlines: ['Shindai-Rengoku', 'Apollo-Sand', 'Shizen'], archetype: ['Ancient Power', 'Defense', 'Strategy'], combatArt: 'Elemental Arts' },
  { id: 'seo-gangrim', name: 'Seo Gangrim', series: 'SSS-Class Suicide Hunter', version: 'Death Copy', bloodlines: ['Bankai-Akuma', 'Doom-Shado', 'Getsuga-Black'], archetype: ['Copy', 'Death', 'Sword'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'lucas-traumen', name: 'Lucas Traumen', series: 'The Great Mage Returns', version: 'Nine-Star Mage', bloodlines: ['Order', 'Chaos', 'Pyromania', 'Shindai-Rengoku'], archetype: ['Mage', 'Elemental', 'Destruction'], combatArt: 'Magic' },
  { id: 'desir-arman', name: 'Desir Arman', series: 'A Returner’s Magic Should Be Special', version: 'Magic Analyst', bloodlines: ['Order', 'Doku-Tengoku', 'Dio-Senko-Rose'], archetype: ['Mage', 'Analysis', 'Counter'], combatArt: 'Magic' },
  { id: 'ijin-yu', name: 'Ijin Yu', series: 'Mercenary Enrollment', version: 'Teenage Mercenary', bloodlines: ['Doku-Tengoku', 'Bruce-Kenichi', 'Minakaze'], archetype: ['Soldier', 'CQC', 'Assassin'], combatArt: 'Mixed Martial Arts', weapon: 'Combat Knife' },
  { id: 'teenage-mercenary-002', name: '002', series: 'Mercenary Enrollment', version: 'Numbers Assassin', bloodlines: ['Minakaze', 'Doku-Tengoku', 'Dio-Senko-Rose'], archetype: ['Assassin', 'Speed', 'Tactical'], combatArt: 'Mixed Martial Arts', weapon: 'Knife and Sidearm' },
  { id: 'gray-yeon-tools', name: 'Gray Yeon', series: 'Weak Hero', version: 'Environmental Weapons', bloodlines: ['Doku-Tengoku', 'Minakaze', 'Jokei'], archetype: ['Intelligence', 'Counter', 'Tools'], combatArt: 'Boxing', weapon: 'Improvised Tools' },
  { id: 'donald-na', name: 'Donald Na', series: 'Weak Hero', version: 'Union Head', bloodlines: ['Bruce-Kenichi', 'Ryuji-Kenichi', 'Doku-Tengoku'], archetype: ['Strategy', 'Power', 'Technique'], combatArt: 'Mixed Martial Arts' },
  { id: 'ben-park', name: 'Ben Park', series: 'Weak Hero', version: 'Big Ben', bloodlines: ['Ryuji-Kenichi', 'Ashura-Shizen'], archetype: ['Power', 'Durability', 'Brawler'], combatArt: 'Mixed Martial Arts' },
  { id: 'nagyuun', name: 'Nagyuun', series: 'The Ember Knight', version: 'False Knight', bloodlines: ['Doku-Tengoku', 'Minakaze', 'Bankai-Akuma'], archetype: ['Strategy', 'Prediction', 'Trickery'], combatArt: 'Tactical Arts' },
  { id: 'rania', name: 'Rania', series: 'The Ember Knight', version: 'Knight of Speed', bloodlines: ['Getsuga-Black', 'Dio-Senko-Rose', 'Bruce-Kenichi'], archetype: ['Knight', 'Sword', 'Speed'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'hanbin-ryu', name: 'Hanbin Ryu', series: 'Latna Saga', version: 'Survival Sword King', bloodlines: ['Ryuji-Kenichi', 'Ashura-Shizen', 'Demon Gate Spirit'], archetype: ['Berserker', 'Strength', 'Tank'], combatArt: 'Greatsword Arts', weapon: 'Greatsword' },
  { id: 'barolt-aura', name: 'Barolt', series: 'Latna Saga', version: 'Aura Sword King', bloodlines: ['Ryuji-Kenichi', 'Ashura-Shizen', 'Bruce-Kenichi'], archetype: ['Aura', 'Strength', 'Warrior'], combatArt: 'Greatsword Arts', weapon: 'Greatsword' },
  { id: 'karsia', name: 'Karsia', series: 'The Great Mage Returns', version: 'Archmage', bloodlines: ['Order', 'Light-Jokei', 'Shindai-Rengoku'], archetype: ['Mage', 'Light', 'Control'], combatArt: 'Magic' },
  { id: 'joo-seoh-cheon', name: 'Joo Seoh-Cheon', series: 'Volcanic Age', version: 'Regressed Plum Blossom', bloodlines: ['Getsuga', 'Dio-Senko-Rose', 'Bruce-Kenichi'], archetype: ['Sword', 'Regression', 'Technique'], combatArt: 'Kenjutsu', weapon: 'Sword' },
  { id: 'yi-zaha', name: 'Yi Zaha', series: 'Return of the Mad Demon', version: 'Mad Demon', bloodlines: ['Bankai-Akuma', 'Bruce-Kenichi', 'Doom-Shado'], archetype: ['Madness', 'Martial Arts', 'Dark'], combatArt: 'Mixed Martial Arts' },
]

function elementsFor(archetype: string[]) {
  const joined = archetype.join(' ').toLowerCase()
  if (joined.includes('lightning')) return ['Lightning', 'Order']
  if (joined.includes('shadow') || joined.includes('dark') || joined.includes('death')) return ['Fire', 'Order']
  if (joined.includes('mage') || joined.includes('elemental')) return ['Order', 'Chaos']
  if (joined.includes('speed')) return ['Gale', 'Lightning']
  if (joined.includes('sword') || joined.includes('spear')) return ['Gale', 'Order']
  return ['Earth', 'Fire']
}

function ratingsFor(spec: ExtraSpec, index: number): Seed['ratings'] {
  const tags = spec.archetype.join(' ').toLowerCase()
  const accuracy = Math.min(9.6, 8.3 + ((index * 3) % 12) / 10)
  const pvp = Math.min(9.6, 8.1 + ((index * 5) % 14) / 10)
  const mobility = /speed|lightning|evasion/.test(tags) ? 9.3 : 7.4 + (index % 13) / 10
  const combos = /copy|system|technique|mage/.test(tags) ? 9.2 : 8 + (index % 12) / 10
  const defense = /tank|durability|endurance|defense/.test(tags) ? 9.3 : 7.2 + (index % 14) / 10
  const visuals = /final boss|cosmic|dragon|shadow|mage|lightning/.test(tags) ? 9.7 : 8.1 + (index % 14) / 10
  const difficulty = /copy|system|mage|prediction|strategy/.test(tags) ? 8.9 : 7.3 + (index % 15) / 10
  return [accuracy, pvp, mobility, combos, defense, visuals, difficulty].map((value) => Math.round(Math.min(9.9, value) * 10) / 10) as Seed['ratings']
}

seeds.push(...extraSpecs.map((spec, index) => ({
  ...spec,
  description: `${spec.version} translated into a ${spec.archetype.join(', ').toLowerCase()} loadout with character-first routing and practical PvP coverage.`,
  elements: elementsFor(spec.archetype),
  combatArt: spec.combatArt ?? (spec.archetype.includes('Sword') ? 'Kenjutsu' : 'Mixed Martial Arts'),
  ratings: ratingsFor(spec, index),
  aura: /final boss|cosmic|dragon|demon|aura/.test(spec.archetype.join(' ').toLowerCase()) ? 9.8 : undefined,
  status: 'Needs Testing' as const,
})))

export const originalCharacters: CharacterBuild[] = seeds.map(makeBuild)

export function createBlankBuild(): CharacterBuild {
  const base = structuredClone(originalCharacters[0])
  const id = createPermanentId('custom')
  const now = new Date().toISOString()
  return {
    ...base,
    id,
    characterId: createPermanentId('character'),
    versionId: createPermanentId('version'),
    buildName: 'Original Build',
    name: 'Untitled Fighter',
    series: 'Custom',
    version: 'Original Build',
    image: '',
    description: 'Describe how this fighter approaches pressure, movement, and defense.',
    archetype: ['Custom'],
    status: 'Draft',
    notes: 'New local build.',
    createdAt: now,
    updatedAt: now,
    changeHistory: [],
  }
}
