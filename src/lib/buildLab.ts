import type { CharacterBuild, HotbarSlot } from '../types'

export function reorderHotbar(hotbar: HotbarSlot[], from: number, to: number): HotbarSlot[] {
  const next = structuredClone(hotbar)
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function validateBuildLab(build: CharacterBuild): string[] {
  const warnings: string[] = []
  const bloodlines = build.bloodlines.map((slot) => slot.name).filter(Boolean)
  if (new Set(bloodlines).size !== bloodlines.length) warnings.push('Duplicate Bloodline selected.')
  if (bloodlines.length > 4) warnings.push('Too many Bloodline slots.')
  if (build.elements.length < 2) warnings.push('Missing element.')
  if (build.cMode && !bloodlines.includes(build.cMode)) warnings.push('C-mode source does not match a selected Bloodline.')
  const keys = build.hotbar.map((slot) => slot.key)
  if (new Set(keys).size !== keys.length) warnings.push('Hotbar key conflict.')
  build.hotbar.forEach((slot) => {
    if (slot.source && !bloodlines.includes(slot.source) && !build.elements.includes(slot.source) && !/sub|weapon|combat|mode/i.test(slot.source)) {
      warnings.push(`Missing ability source: ${slot.source}.`)
    }
  })
  return [...new Set(warnings)]
}
