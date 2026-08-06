import type { BuildVariant, CharacterBuild } from '../types'
import type { HotbarKey } from '../types/shindoGame'

export type ValidationSeverity = 'Critical' | 'Major' | 'Minor'

export interface ValidationIssue {
  code: string
  severity: ValidationSeverity
  variantId: string
  message: string
}

export interface SlotCountResult {
  bloodlines: { equipped: number; limit: number; valid: boolean }
  elements: { equipped: number; limit: number; valid: boolean }
}

export interface SourceTraceResult {
  key: HotbarKey
  ability: string
  source: string
  traceable: boolean
  reason: string
}

export interface ModeConflictIssue {
  code: 'same-family' | 'simultaneous-conflict' | 'missing-mode'
  severity: ValidationSeverity
  message: string
}

export interface InventedNameIssue {
  variantId: string
  key: string
  ability: string
  severity: ValidationSeverity
}

export interface PrivacyIssue {
  code: string
  severity: ValidationSeverity
  message: string
}

export interface StatsIssue {
  code: string
  severity: ValidationSeverity
  variantId: string
  stat: string
  message: string
}

export interface ComboKeyIssue {
  variantId: string
  comboName: string
  invalidKey: string
  severity: ValidationSeverity
}

export interface BloodlineCompletenessIssue {
  variantId: string
  bloodlineName: string
  code: 'missing-replacements'
  severity: ValidationSeverity
  message: string
}

export interface BuildValidationReport {
  buildId: string
  slotCounts: SlotCountResult[]
  sourceTrace: SourceTraceResult[][]
  modeConflicts: ModeConflictIssue[][]
  comboKeyIssues: ComboKeyIssue[][]
  bloodlineCompleteness: BloodlineCompletenessIssue[][]
  inventedNames: InventedNameIssue[]
  privacyIssues: PrivacyIssue[]
  statsIssues: StatsIssue[][]
  hasBlocker: boolean
}

export const VALID_HOTBAR_KEY_SET = new Set<string>(['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q'])

// All names invented in the removed abilityNames object in characters.ts.
const QUARANTINED_NAMES = new Set([
  'Rose Flash', 'Time Stop Counter', 'Crimson Overdrive',
  'Dragon Heel', 'Axe Kick Barrage', 'Bruce Combo',
  'Ryuji Slam', 'Iron Counter', 'Dragon Pressure',
  'Venom Counter', 'Tengoku Pull', 'Reactive Guard',
  'Pika Flash', 'Light Kick', 'Photon Rush',
  'Reflex Genjutsu', 'Eye Counter', 'Warrior Guard',
  'Shadow Vanish', 'Shade Army', 'Doom Descent',
  'Raion Burst', 'Black Lightning', 'Gaiden Spear',
  'Staff Cyclone', 'Kaijin Impact', 'Tetsuo Shift',
])

// Ownership field names that must never appear on a public build object.
const PROHIBITED_OWNERSHIP_FIELDS = new Set([
  'ownedBy', 'selectedBy', 'purchasedBy', 'ownerEmail', 'userId', 'subscriptionId',
])

const VALID_STAT_NAMES = new Set([
  'Ninjutsu', 'Taijutsu', 'Genjutsu', 'Strength', 'Defense', 'Agility',
])

function isUnresolved(ability: string): boolean {
  return /^Unresolved/i.test(ability.trim())
}

function isNone(value: string): boolean {
  return /^(none|no z-mode|not used|unresolved)/i.test(value.trim())
}

function normalized(value: string): string {
  return value.trim().toLowerCase().replace(/\s+—\s+stage\s+\d+$/i, '')
}

// --- Slot count ---

export function validateSlotCount(variant: BuildVariant): SlotCountResult {
  return {
    bloodlines: {
      equipped: variant.bloodlines.length,
      limit: variant.bloodlineSlotCount,
      valid: variant.bloodlines.length <= variant.bloodlineSlotCount,
    },
    elements: {
      equipped: variant.elements.length,
      limit: variant.elementSlotCount,
      valid: variant.elements.length <= variant.elementSlotCount,
    },
  }
}

// --- Source traceability ---

// Generic labels that are always accepted without an exact loadout match.
const GENERIC_SOURCES = new Set([
  'none', 'sub-ability', 'mode', 'weapon', 'combat art', 'kenjutsu',
  'c-mode', 'z-mode', 'research pending',
])

export function validateSourceTraceability(variant: BuildVariant): SourceTraceResult[] {
  const equippedNames = new Set([
    ...variant.bloodlines.map((slot) => normalized(slot.name)),
    ...variant.elements.map((slot) => normalized(slot.name)),
    normalized(variant.cMode),
    normalized(variant.zMode),
    normalized(variant.weapon),
    normalized(variant.kenjutsu ?? 'none'),
    normalized(variant.combatArt),
    normalized(variant.ninjaTool),
  ])

  return variant.hotbar.map((slot) => {
    const key = slot.key as HotbarKey

    if (isUnresolved(slot.ability)) {
      return { key, ability: slot.ability, source: slot.source, traceable: true, reason: 'Unresolved slot — traceability deferred to research phase.' }
    }

    const normSource = normalized(slot.source).replace(/\s+mode$/, '')

    if (GENERIC_SOURCES.has(normSource)) {
      return { key, ability: slot.ability, source: slot.source, traceable: true, reason: 'Generic source label accepted.' }
    }

    const isVerified = slot.researchStatus === 'verified' || slot.researchStatus === 'owner-confirmed'

    if (isVerified) {
      if (!slot.sourceId) {
        return {
          key, ability: slot.ability, source: slot.source, traceable: false,
          reason: `Verified slot "${slot.ability}" is missing sourceId. Verified slots require an explicit sourceId matching the exact equipped bloodline, element, or mode name.`,
        }
      }
      const normId = normalized(slot.sourceId)
      const traceable = equippedNames.has(normId)
      return {
        key, ability: slot.ability, source: slot.source, traceable,
        reason: traceable
          ? `sourceId "${slot.sourceId}" confirmed in equipped loadout.`
          : `sourceId "${slot.sourceId}" not found in equipped loadout. Partial or family names (e.g., "Raion" vs "Raion-Gaiden") are not accepted — use the full equipped name.`,
      }
    }

    // Non-verified resolved slot: exact normalized match only (no substring).
    const traceable = equippedNames.has(normSource)
    return {
      key, ability: slot.ability, source: slot.source, traceable,
      reason: traceable
        ? 'Source exactly matched in equipped loadout.'
        : `"${slot.source}" not found in equipped loadout (exact match required). Partial or family names (e.g., "Raion" vs "Raion-Gaiden") are not accepted.`,
    }
  })
}

// --- Combo key validation ---

export function validateComboKeys(variant: BuildVariant): ComboKeyIssue[] {
  const issues: ComboKeyIssue[] = []
  for (const combo of variant.combos) {
    for (const key of combo.sequence as string[]) {
      if (!VALID_HOTBAR_KEY_SET.has(key)) {
        issues.push({ variantId: variant.id, comboName: combo.name, invalidKey: key, severity: 'Major' })
      }
    }
  }
  return issues
}

// --- Mode conflicts ---

const MODE_FAMILIES: readonly (readonly string[])[] = [
  ['Getsuga', 'Getsuga-Black'],
  ['Raion-Akuma', 'Raion-Rengoku', 'Raion-Gaiden'],
  ['Akuma', 'Bankai-Akuma', 'Shindai-Akuma', 'Riser-Akuma', 'Shiver-Akuma', 'Indra-Akuma'],
  ['Minakaze', 'Minakaze-Azure', 'Minakaze-Ruby'],
  ['Aizden', 'Aizden-Inverse'],
  ['Narumaki', 'Narumaki-Ruby'],
  ['Borumaki', 'Borumaki-Shiki', 'Borumaki-Gaiden'],
]

export function validateModeConflicts(variant: BuildVariant): ModeConflictIssue[] {
  const issues: ModeConflictIssue[] = []

  if (!isNone(variant.cMode) && !isNone(variant.zMode) && variant.simultaneousModeLegality === 'illegal') {
    issues.push({
      code: 'simultaneous-conflict',
      severity: 'Critical',
      message: `${variant.cMode} and ${variant.zMode} are declared incompatible (simultaneousModeLegality: "illegal") but both appear as active recommendations.`,
    })
  }

  for (const family of MODE_FAMILIES) {
    const cInFamily = family.some((name) => variant.cMode.toLowerCase().includes(name.toLowerCase()))
    const zInFamily = family.some((name) => variant.zMode.toLowerCase().includes(name.toLowerCase()))
    if (!isNone(variant.cMode) && !isNone(variant.zMode) && cInFamily && zInFamily) {
      issues.push({
        code: 'same-family',
        severity: 'Major',
        message: `C-mode (${variant.cMode}) and Z-mode (${variant.zMode}) are from the same Bloodline family. Confirm both are equippable simultaneously.`,
      })
    }
  }

  return issues
}

// --- Bloodline completeness ---

export function validateBloodlineCompleteness(variant: BuildVariant): BloodlineCompletenessIssue[] {
  const issues: BloodlineCompletenessIssue[] = []
  for (const slot of variant.bloodlines) {
    if (!slot.exactMovesUsed?.length) continue
    const rep = slot.replacements
    const hasAny = rep && (rep.lore.length > 0 || rep.competitive.length > 0 || rep.accessible.length > 0)
    if (!hasAny) {
      issues.push({
        variantId: variant.id,
        bloodlineName: slot.name,
        code: 'missing-replacements',
        severity: 'Minor',
        message: `Bloodline "${slot.name}" has exactMovesUsed but no alternatives listed. Add at least one lore, competitive, or accessible replacement.`,
      })
    }
  }
  return issues
}

// --- Invented name detection ---

export function validateInventedNames(build: CharacterBuild): InventedNameIssue[] {
  const issues: InventedNameIssue[] = []
  for (const variant of build.variants) {
    for (const slot of variant.hotbar) {
      const ability = slot.ability.trim()
      if (isUnresolved(ability)) continue
      if (QUARANTINED_NAMES.has(ability)) {
        issues.push({ variantId: variant.id, key: slot.key, ability, severity: 'Critical' })
      }
    }
  }
  return issues
}

// --- Stats allocation ---

export function validateStatsAllocation(variant: BuildVariant): StatsIssue[] {
  if (!variant.statsAllocation) return []
  const issues: StatsIssue[] = []
  let total = 0
  for (const [stat, value] of Object.entries(variant.statsAllocation)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      issues.push({ code: 'invalid-stat-value', severity: 'Major', variantId: variant.id, stat, message: `${stat} has invalid value ${String(value)}.` })
    } else {
      total += value
    }
    if (!VALID_STAT_NAMES.has(stat)) {
      issues.push({ code: 'unknown-stat-name', severity: 'Minor', variantId: variant.id, stat, message: `"${stat}" is not a recognized Shindo stat name. Expected one of: ${[...VALID_STAT_NAMES].join(', ')}.` })
    }
  }
  if (total > 1500) {
    issues.push({ code: 'stat-total-unrealistic', severity: 'Minor', variantId: variant.id, stat: 'total', message: `Total stat allocation ${total} exceeds 1500 — check for double-counting.` })
  }
  return issues
}

// --- Premium privacy ---

export function validatePremiumPrivacy(build: CharacterBuild): PrivacyIssue[] {
  const issues: PrivacyIssue[] = []

  // Check no ownership fields embedded in the build object itself.
  for (const key of Object.keys(build as unknown as Record<string, unknown>)) {
    if (PROHIBITED_OWNERSHIP_FIELDS.has(key)) {
      issues.push({ code: 'ownership-field-in-build', severity: 'Critical', message: `Build "${build.id}" has prohibited ownership field "${key}".` })
    }
  }

  // Non-reviewed builds must not have verified/owner-confirmed slot data.
  if (build.publicationStatus !== 'Reviewed') {
    for (const variant of build.variants) {
      const hasVerifiedSlots = variant.hotbar.some(
        (slot) => slot.researchStatus === 'verified' || slot.researchStatus === 'owner-confirmed',
      )
      if (hasVerifiedSlots) {
        issues.push({
          code: 'unreviewed-build-with-verified-slots',
          severity: 'Major',
          message: `Build "${build.id}" (${build.publicationStatus}) has verified hotbar slots in variant "${variant.id}". Verified data must only appear in Reviewed builds.`,
        })
      }
    }
  }

  return issues
}

// --- Full report ---

export function runBuildValidation(build: CharacterBuild): BuildValidationReport {
  const slotCounts = build.variants.map(validateSlotCount)
  const sourceTrace = build.variants.map(validateSourceTraceability)
  const modeConflicts = build.variants.map(validateModeConflicts)
  const comboKeyIssues = build.variants.map(validateComboKeys)
  const bloodlineCompleteness = build.variants.map(validateBloodlineCompleteness)
  const statsIssues = build.variants.map(validateStatsAllocation)
  const inventedNames = validateInventedNames(build)
  const privacyIssues = validatePremiumPrivacy(build)

  const hasBlocker =
    slotCounts.some((r) => !r.bloodlines.valid || !r.elements.valid) ||
    sourceTrace.some((r) => r.some((slot) => !slot.traceable)) ||
    modeConflicts.some((r) => r.some((issue) => issue.severity === 'Critical')) ||
    comboKeyIssues.some((r) => r.some((issue) => issue.severity === 'Critical' || issue.severity === 'Major')) ||
    statsIssues.some((r) => r.some((issue) => issue.severity === 'Critical' || issue.severity === 'Major')) ||
    inventedNames.some((issue) => issue.severity === 'Critical') ||
    privacyIssues.some((issue) => issue.severity === 'Critical')

  return { buildId: build.id, slotCounts, sourceTrace, modeConflicts, comboKeyIssues, bloodlineCompleteness, inventedNames, privacyIssues, statsIssues, hasBlocker }
}
