import type { BloodlineSlot, CharacterBuild, ElementSlot, HotbarKey, HotbarSlot } from '../types'

export const VALID_HOTBAR_KEYS: HotbarKey[] = ['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q']
const VALID_HOTBAR_KEY_SET = new Set<string>(VALID_HOTBAR_KEYS)

/**
 * Splits a legacy string[] combo sequence into valid HotbarKeys and rejected strings.
 * Safe to call on already-typed HotbarKey[] data.
 */
export function migrateComboSequence(sequence: string[]): { valid: HotbarKey[]; invalid: string[] } {
  const valid: HotbarKey[] = []
  const invalid: string[] = []
  for (const key of sequence) {
    if (VALID_HOTBAR_KEY_SET.has(key)) {
      valid.push(key as HotbarKey)
    } else {
      invalid.push(key)
    }
  }
  return { valid, invalid }
}

/**
 * Coerces an untyped object into a canonical BloodlineSlot.
 * Preserves all recognized fields; leaves unrecognized fields behind.
 */
export function migrateBloodlineSlot(slot: Record<string, unknown>): BloodlineSlot {
  const vs = slot.verificationStatus as string | undefined
  const rep = slot.replacements
  return {
    id: typeof slot.id === 'string' ? slot.id : undefined,
    name: String(slot.name ?? ''),
    purpose: String(slot.purpose ?? ''),
    useMode: Boolean(slot.useMode),
    exactMovesUsed: Array.isArray(slot.exactMovesUsed) ? [...(slot.exactMovesUsed as string[])] : [],
    reason: typeof slot.reason === 'string' ? slot.reason : undefined,
    represents: typeof slot.represents === 'string' ? slot.represents : undefined,
    replacements:
      rep !== null && typeof rep === 'object' && !Array.isArray(rep)
        ? {
            lore: [...(((rep as Record<string, unknown>).lore as string[]) ?? [])],
            competitive: [...(((rep as Record<string, unknown>).competitive as string[]) ?? [])],
            accessible: [...(((rep as Record<string, unknown>).accessible as string[]) ?? [])],
          }
        : undefined,
    evidence: Array.isArray(slot.evidence) ? [...(slot.evidence as string[])] : undefined,
    verificationStatus:
      vs === 'verified' || vs === 'needs-research' || vs === 'unresolved' ? vs : undefined,
  }
}

export interface VerifiedSlotParams {
  key: HotbarKey
  ability: string
  sourceId: string
  sourceType: HotbarSlot['sourceType']
  researchStatus: 'verified' | 'owner-confirmed'
  source?: string
  purpose?: string
  comboRole?: string
  blockBreak?: boolean
  usageNotes?: string
  evidenceNote?: string
}

export function createVerifiedSlot(params: VerifiedSlotParams): HotbarSlot {
  if (!params.sourceId || !params.sourceId.trim()) {
    throw new Error(
      `createVerifiedSlot: sourceId is required for a verified slot (key=${params.key}, ability="${params.ability}"). ` +
      `Set sourceId to the exact equipped bloodline, element, or mode name.`,
    )
  }
  return {
    id: `verified-${params.key}-${params.sourceId.replace(/\s+/g, '-')}`,
    key: params.key,
    ability: params.ability,
    source: params.source ?? params.sourceId,
    sourceId: params.sourceId,
    sourceType: params.sourceType,
    purpose: params.purpose ?? '',
    comboRole: params.comboRole ?? 'Not specified',
    blockBreak: params.blockBreak ?? false,
    usageNotes: params.usageNotes ?? '',
    researchStatus: params.researchStatus,
    evidenceNote: params.evidenceNote,
  }
}

export function isElementSlot(value: unknown): value is ElementSlot {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).name === 'string'
  )
}

/**
 * Returns structured ElementSlots from either the new elementSlots field
 * or by wrapping the legacy elements string array. Always safe to call.
 */
export function getElementSlots(build: CharacterBuild): ElementSlot[] {
  if (build.elementSlots && build.elementSlots.length > 0) return build.elementSlots
  return build.elements.map((name) => ({
    name,
    exactMovesUsed: [],
    purpose: '',
    replacements: [],
  }))
}

/**
 * Returns a build with elementSlots populated from the elements array,
 * without modifying the original elements string array.
 */
export function normalizeBuildElements(build: CharacterBuild): CharacterBuild {
  if (build.elementSlots && build.elementSlots.length > 0) return build
  return { ...build, elementSlots: getElementSlots(build) }
}
