import type { CharacterBuild, ElementSlot } from '../types'

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
