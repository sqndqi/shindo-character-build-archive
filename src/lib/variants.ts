import type { BuildVariant } from '../types'
import type { CollectionState } from '../hooks/useBloodlineCollection'

export const unusedControl = 'Not used in this variant'

export function variantKenjutsu(variant: BuildVariant) {
  return variant.kenjutsu?.trim() || 'None'
}

export function variantEquipment(variant: BuildVariant) {
  return variant.equipment ?? {
    ninjaTool: variant.ninjaTool,
    ninjaToolReason: variant.ninjaTool === 'None' ? 'No character-specific ninja tool is required.' : 'Legacy selection; editorial reason is still being researched.',
    consumable: variant.consumable,
    consumableReason: variant.consumable === 'None' ? 'No character-specific consumable is required.' : 'Legacy selection; editorial reason is still being researched.',
    mentor: variant.mentor,
    mentorReason: variant.mentor === 'None' ? 'No mentor is required for this concept.' : 'Legacy selection; editorial reason is still being researched.',
    race: variant.race,
    raceReason: variant.race === 'None' ? 'No race is required for this concept.' : 'Legacy selection; editorial reason is still being researched.',
  }
}

export function variantQAction(variant: BuildVariant) {
  if (variant.qAction) return variant.qAction
  if (variant.weapon !== 'None') return { source: 'Weapon' as const, name: `${variant.weapon} Q action`, purpose: 'Weapon action; exact behavior still needs editorial review.' }
  if (variantKenjutsu(variant) !== 'None') return { source: 'Kenjutsu' as const, name: `${variantKenjutsu(variant)} Q spec`, purpose: 'Kenjutsu action; exact behavior still needs editorial review.' }
  if (variant.combatArt !== 'None') return { source: 'Combat Art' as const, name: `${variant.combatArt} Q action`, purpose: 'Combat Art basic action.' }
  return { source: 'None' as const, name: unusedControl, purpose: 'This setup intentionally leaves Q unused.' }
}

export type VariantInventoryMatch = {
  variant: BuildVariant
  missing: string[]
  owned: number
  total: number
}

export function inventoryMatch(variant: BuildVariant, collection: CollectionState): VariantInventoryMatch {
  const requirements = [
    ...variant.bloodlines.map((slot) => ['bloodline', slot.name] as const),
    ...variant.elements.map((slot) => ['element', slot.name] as const),
    ...(variant.cMode === 'None' ? [] : [['mode', variant.cMode.split(' — ')[0]] as const]),
    ...[variant.combatArt, variantKenjutsu(variant), variant.weapon, variant.ninjaTool]
      .filter((name) => name && name !== 'None')
      .map((name) => ['equipment', name] as const),
  ]
  const missing = requirements.filter(([category, name]) => {
    const source = category === 'bloodline'
      ? collection.statuses
      : category === 'element'
        ? collection.elementStatuses
        : category === 'mode'
          ? collection.modeStatuses
          : collection.equipmentStatuses
    return source[name] !== 'Owned'
  }).map(([, name]) => name)
  return { variant, missing, owned: requirements.length - missing.length, total: requirements.length }
}

export function closestPreparedVariant(variants: BuildVariant[], collection: CollectionState) {
  const selectable = variants.filter((variant) => variant.hotbarLegalityStatus !== 'Invalid')
  return (selectable.length ? selectable : variants).map((variant) => inventoryMatch(variant, collection)).sort((a, b) =>
    a.missing.length - b.missing.length
    || b.variant.ratings.accuracy - a.variant.ratings.accuracy
    || b.variant.bloodlineSlotCount - a.variant.bloodlineSlotCount)[0]
}

export function preparedVariantLabels(variants: BuildVariant[]) {
  return {
    two: variants.some((variant) => variant.bloodlineSlotCount === 2),
    three: variants.some((variant) => variant.bloodlineSlotCount === 3),
    four: variants.some((variant) => variant.bloodlineSlotCount === 4),
    accessible: variants.some((variant) => variant.type === 'Beginner' || /accessible/i.test(variant.name)),
  }
}
