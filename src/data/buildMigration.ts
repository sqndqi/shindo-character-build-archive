import type { BloodlineSlot, CharacterBuild, ElementSlot, HotbarKey } from '../types'

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
  return {
    id: typeof slot.id === 'string' ? slot.id : undefined,
    name: String(slot.name ?? ''),
    purpose: String(slot.purpose ?? ''),
    useMode: Boolean(slot.useMode),
    exactMovesUsed: Array.isArray(slot.exactMovesUsed) ? (slot.exactMovesUsed as string[]) : [],
    reason: typeof slot.reason === 'string' ? slot.reason : undefined,
    represents: typeof slot.represents === 'string' ? slot.represents : undefined,
    replacements:
      slot.replacements !== null && typeof slot.replacements === 'object' && !Array.isArray(slot.replacements)
        ? (slot.replacements as BloodlineSlot['replacements'])
        : undefined,
    evidence: Array.isArray(slot.evidence) ? (slot.evidence as string[]) : undefined,
    verificationStatus:
      vs === 'verified' || vs === 'needs-research' || vs === 'unresolved' ? vs : undefined,
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
