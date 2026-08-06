import type { BuildVariant, CharacterBuild } from '../types'

export type BuildQualitySeverity = 'Critical' | 'Major' | 'Minor' | 'Editorial'

export type BuildQualityIssue = {
  code: string
  severity: BuildQualitySeverity
  title: string
  message: string
  variantId: string
}

const familyDefinitions = [
  { id: 'snakeman', names: ['SnakeMan', 'SnakeMan-Platinum'] },
  { id: 'getsuga', names: ['Getsuga', 'Getsuga-Black'] },
  { id: 'narumaki', names: ['Narumaki', 'Narumaki-Ruby'] },
  { id: 'minakaze', names: ['Minakaze', 'Minakaze-Azure', 'Minakaze-Ruby'] },
  { id: 'aizden', names: ['Aizden', 'Aizden-Inverse'] },
  { id: 'borumaki', names: ['Borumaki', 'Borumaki-Shiki', 'Borumaki-Gaiden'] },
  { id: 'raion', names: ['Raion-Akuma', 'Raion-Rengoku', 'Raion-Gaiden'] },
  { id: 'akuma', names: ['Akuma', 'Bankai-Akuma', 'Riser-Akuma', 'Shiver-Akuma', 'Shindai-Akuma', 'Indra-Akuma'] },
] as const

const fillerEquipment = new Set(['Dagai', 'Chi Pot', 'Basic Combat', 'Shindai Akuma', 'Shinobi'])
const normalized = (value: string) => value.trim().toLowerCase().replace(/\s+—\s+stage\s+\d+$/i, '')
const isNone = (value: string) => /^(none|no z-mode|not used|unresolved)/i.test(value.trim())

export function findBloodlineFamilyDuplicates(variant: BuildVariant) {
  return familyDefinitions.flatMap((family) => {
    const used = family.names.filter((name) => variant.bloodlines.some((slot) => normalized(slot.name) === normalized(name)))
    return used.length > 1 ? [{ family: family.id, bloodlines: [...used] }] : []
  })
}

function hasEquipmentReason(variant: BuildVariant, value: string) {
  if (!value || isNone(value)) return true
  const text = [
    variant.combatArtReason ?? '',
    variant.kenjutsuReason ?? '',
    variant.weaponReason ?? '',
    variant.equipment?.ninjaToolReason ?? '',
    variant.equipment?.consumableReason ?? '',
    variant.equipment?.mentorReason ?? '',
    variant.equipment?.raceReason ?? '',
    ...variant.usageGuide,
    ...variant.strengths,
    ...variant.weaknesses,
    ...(variant.compromises ?? []),
  ].join(' ').toLowerCase()
  return text.includes(value.toLowerCase())
}

export function auditVariant(variant: BuildVariant): BuildQualityIssue[] {
  const issues: BuildQualityIssue[] = []
  const push = (code: string, severity: BuildQualitySeverity, title: string, message: string) =>
    issues.push({ code, severity, title, message, variantId: variant.id })

  for (const duplicate of findBloodlineFamilyDuplicates(variant)) {
    const documented = duplicate.bloodlines.every((name) => {
      const slot = variant.bloodlines.find((item) => item.name === name)
      return Boolean(slot?.exactMovesUsed.length && slot.reason && slot.represents)
    })
    push(
      `bloodline-family-${duplicate.family}`,
      documented ? 'Minor' : 'Major',
      'Related Bloodlines share this loadout',
      `${duplicate.bloodlines.join(' and ')} belong to the same family. Confirm that each slot contributes a distinct required move.`,
    )
  }

  for (const [field, value] of [
    ['Combat Art', variant.combatArt],
    ['Ninja tool', variant.ninjaTool],
    ['Consumable', variant.consumable],
    ['Mentor', variant.mentor],
    ['Race', variant.race],
  ] as const) {
    if (fillerEquipment.has(value) && !hasEquipmentReason(variant, value)) {
      push(`filler-${field.toLowerCase().replace(' ', '-')}`, 'Editorial', `${field} needs a character-specific reason`, `${value} is common across the archive and may be optional filler.`)
    }
  }

  if (!isNone(variant.cMode) && !isNone(variant.zMode)) {
    push('mode-compatibility', 'Minor', 'C- and Z-mode compatibility needs testing', `${variant.cMode} and ${variant.zMode} are both active recommendations. Confirm their controls and appearance work together.`)
  }

  const activeMoves = variant.hotbar.filter((slot) => !isNone(slot.ability))
  const duplicateMoves = [...new Set(activeMoves.map((slot) => normalized(slot.ability)).filter((move, index, all) => all.indexOf(move) !== index))]
  if (duplicateMoves.length) push('duplicate-hotbar-move', 'Major', 'A move is assigned more than once', 'The hotbar should not spend multiple controls on the same move.')

  const equippedSources = new Set([
    ...variant.bloodlines.map((slot) => normalized(slot.name)),
    ...variant.elements.map((slot) => normalized(slot.name)),
    normalized(variant.cMode),
    normalized(variant.zMode),
    normalized(variant.weapon),
    normalized(variant.kenjutsu ?? 'None'),
    normalized(variant.combatArt),
    normalized(variant.ninjaTool),
    'none',
    'combat art',
    'weapon',
    'mode',
    'sub-ability',
    'ninja tool',
    'kenjutsu',
    ...(variant.qAction ? [normalized(variant.qAction.source)] : []),
  ])
  for (const slot of activeMoves) {
    const source = normalized(slot.source)
    const sourceBase = source.replace(/\s+mode$/, '')
    if (![...equippedSources].some((equipped) => source === equipped || sourceBase === equipped || source.includes(equipped) || equipped.includes(sourceBase))) {
      push('unequipped-hotbar-source', 'Critical', `Hotbar ${slot.key} uses an unequipped source`, `${slot.ability} lists ${slot.source}, which is not part of this prepared variant.`)
    }
  }

  const roles = activeMoves.map((slot) => `${slot.comboRole} ${slot.purpose}`.toLowerCase())
  if (!roles.some((role) => /counter|defen|reversal|escape|evade/.test(role))) {
    push('no-defense', 'Minor', 'No defensive option is documented', 'This may be intentional, but the weakness should be explained.')
  }
  if (!activeMoves.some((slot) => slot.blockBreak || slot.guardPressure || /guard|block break|block-break/i.test(`${slot.comboRole} ${slot.purpose}`))) {
    push('no-guard-pressure', 'Minor', 'No guard-pressure option is documented', 'Do not add filler; document the limitation or verify a real option.')
  }
  if (variant.hotbar.length !== 12) push('hotbar-count', 'Critical', 'Hotbar control count is invalid', `Expected 12 controls but found ${variant.hotbar.length}.`)

  // Phase 4D: weapon abilities without the weapon
  const weaponSlots = activeMoves.filter((slot) => slot.sourceType === 'Weapon' || /weapon/i.test(slot.source))
  if (weaponSlots.length && isNone(variant.weapon)) {
    push('weapon-ability-no-weapon', 'Critical', 'Weapon ability without a weapon equipped', 'Hotbar uses weapon-sourced moves but no weapon is selected.')
  }

  // Phase 4D: kenjutsu moves without kenjutsu
  const kenjutsuSlots = activeMoves.filter((slot) => slot.sourceType === 'Kenjutsu' || /kenjutsu/i.test(slot.source))
  if (kenjutsuSlots.length && isNone(variant.kenjutsu ?? 'None')) {
    push('kenjutsu-ability-no-kenjutsu', 'Critical', 'Kenjutsu ability without Kenjutsu equipped', 'Hotbar uses kenjutsu-sourced moves but no Kenjutsu is selected.')
  }

  // Phase 4D: vague placeholder abilities
  const vaguePattern = /^(best move|strong attack|character move|good ability|any move|placeholder|tbd|todo)$/i
  for (const slot of activeMoves) {
    if (vaguePattern.test(slot.ability.trim())) {
      push(`vague-placeholder-${slot.key}`, 'Major', `Hotbar ${slot.key} uses a vague placeholder`, `"${slot.ability}" is not a real Shindo move. Research or mark as unresolved.`)
    }
  }

  // Phase 4D: mode referenced in hotbar but not in cMode/zMode
  const modeSlots = activeMoves.filter((slot) => slot.sourceType === 'Mode' || slot.modeAbility)
  for (const slot of modeSlots) {
    const modeSource = normalized(slot.modeRequirement ?? slot.source)
    const cNorm = normalized(variant.cMode)
    const zNorm = normalized(variant.zMode)
    if (modeSource && !isNone(modeSource) && modeSource !== cNorm && modeSource !== zNorm && !cNorm.includes(modeSource) && !zNorm.includes(modeSource)) {
      push(`mode-not-equipped-${slot.key}`, 'Major', `Hotbar ${slot.key} references an unequipped mode`, `${slot.ability} requires ${slot.modeRequirement ?? slot.source}, which is not the C-mode or Z-mode.`)
    }
  }

  // Phase 4D: missing mode recommendation when modes are used
  if (modeSlots.length && isNone(variant.cMode) && isNone(variant.zMode)) {
    push('missing-mode-recommendation', 'Minor', 'Mode abilities used but no mode is recommended', 'Hotbar includes mode-sourced moves. Specify a C-mode or Z-mode recommendation.')
  }

  // Phase 4D: missing weapon decision
  if (isNone(variant.weapon) && !variant.weaponReason) {
    const hasWeaponContext = [...variant.strengths, ...variant.weaknesses, ...variant.usageGuide].join(' ').toLowerCase().includes('weapon')
    if (!hasWeaponContext) {
      push('missing-weapon-decision', 'Editorial', 'No weapon decision documented', 'Either equip a weapon or explain why one is not used.')
    }
  }

  return issues
}

export function auditBuild(build: CharacterBuild) {
  return build.variants.flatMap(auditVariant)
}
