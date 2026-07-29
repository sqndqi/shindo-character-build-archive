import type { CharacterBuild } from '../types'

export function analyzeBuild(build: CharacterBuild) {
  const starters = build.hotbar.filter((slot) => /starter|engage/i.test(slot.comboRole)).length
  const mobility = build.hotbar.filter((slot) => /mobility|chase|escape/i.test(`${slot.purpose} ${slot.comboRole}`)).length
  const defense = build.hotbar.filter((slot) => /counter|defen|escape|reversal/i.test(`${slot.purpose} ${slot.comboRole}`)).length
  const blockBreaks = build.hotbar.filter((slot) => slot.blockBreak).length
  const heavyResource = build.hotbar.filter((slot) => /heavy|high/i.test(slot.usageNotes)).length
  const warnings: string[] = []
  if (starters > 3) warnings.push('Too many combo starters may overlap.')
  if (!blockBreaks) warnings.push('No reliable block break is documented.')
  if (!defense) warnings.push('No defensive or reversal option is documented.')
  if (mobility >= 3) warnings.push('Three mobility moves may be redundant.')
  if (heavyResource >= 4) warnings.push('Heavy Chi or stamina usage across the route.')
  if (build.cMode && build.zMode && build.cMode === build.zMode) warnings.push('Both mode slots compete for the same source.')
  const coverage = Math.min(10, starters * 1.4 + blockBreaks * 1.5 + defense * 1.3 + Math.min(mobility, 2))
  const score = Math.max(0, Math.min(10, Number(((coverage + build.ratings.combos + build.ratings.defense) / 3).toFixed(1))))
  return { score, warnings, counts: { starters, mobility, defense, blockBreaks } }
}

export function buildCompletion(build: CharacterBuild): number {
  const checks = [
    build.bloodlines.length > 0,
    build.elements.length === 2,
    build.hotbar.length === 12 && build.hotbar.every((slot) => slot.ability && slot.source),
    Boolean(build.cMode || build.zMode),
    Boolean(build.combatArt),
    Boolean(build.mentor),
    Boolean(build.race),
    Boolean(build.ninjaTool && build.consumable),
    build.combos.length >= 3,
    Boolean(build.description && build.notes),
    Boolean(build.image),
    build.substitutions.length > 0,
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}

export function hotbarText(build: CharacterBuild): string {
  return build.hotbar.map((slot) => `${slot.key} — ${slot.ability} · ${slot.source} · ${slot.comboRole}`).join('\n')
}
