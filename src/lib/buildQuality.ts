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

  return issues
}

export function auditBuild(build: CharacterBuild) {
  return build.variants.flatMap(auditVariant)
}
