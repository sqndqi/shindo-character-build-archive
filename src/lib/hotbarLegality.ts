import type { BuildVariant } from '../types'
import { shindoMoveById, shindoSourceByName } from '../data/shindoGameData'
import type {
  HotbarKey,
  HotbarLegalityIssue,
  HotbarLegalityResult,
  PreparedHotbarProfile,
} from '../types/shindoGame'

export const HOTBAR_KEYS: HotbarKey[] = ['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q']
export const GENERAL_KEYS: HotbarKey[] = ['1', '2', '3', '4', '5', 'T']
export const BLOODLINE_KEYS: HotbarKey[] = ['V', 'B', 'N']

export function validatePreparedHotbar(variant: BuildVariant, profile: PreparedHotbarProfile): HotbarLegalityResult {
  const issues: HotbarLegalityIssue[] = []
  const equippedBloodlines = new Set(variant.bloodlines.map((source) => source.name))
  const equippedElements = new Set(variant.elements.map((source) => source.name))
  const usedMoveIds = new Set<string>()
  const usedSources = new Set<string>()
  const qSystems = new Set<string>()
  let bloodlineRowMoves = 0

  if (variant.elements.length > variant.elementSlotCount) {
    issues.push(issue('element-slot-limit', 'Error', `This profile equips ${variant.elements.length} elements in a ${variant.elementSlotCount}-slot profile.`))
  }

  for (const [rawKey, moveId] of Object.entries(profile.slots)) {
    const key = rawKey as HotbarKey
    if (!HOTBAR_KEYS.includes(key)) {
      issues.push(issue('invalid-key', 'Error', `${key} is not a supported hotbar control.`, key))
      continue
    }
    if (!moveId) continue
    const move = shindoMoveById.get(moveId)
    if (!move) {
      issues.push(issue('unknown-move', 'Error', `The canonical move record ${moveId} does not exist.`, key, moveId))
      continue
    }
    if (usedMoveIds.has(moveId)) issues.push(issue('duplicate-move', 'Error', `${move.name} is assigned more than once.`, key, moveId))
    usedMoveIds.add(moveId)
    usedSources.add(move.sourceName)

    if (!move.placement.allowedKeys.includes(key)) {
      const severity = move.placement.flexiblePlacement ? 'Needs Evidence' : 'Error'
      issues.push(issue('wrong-row', severity, `${move.name} cannot be placed on ${key} from the evidence currently recorded.`, key, moveId))
    }
    if (GENERAL_KEYS.includes(key) && move.sourceType === 'Bloodline' && !move.placement.flexiblePlacement) {
      issues.push(issue('wrong-row', 'Error', `${move.name} is an ordinary Bloodline-row move, not a general-row move.`, key, moveId))
    }
    if (BLOODLINE_KEYS.includes(key)) {
      if (move.sourceType === 'Bloodline') bloodlineRowMoves += 1
      if (move.sourceType === 'Element') issues.push(issue('wrong-row', 'Error', `${move.name} is an Element move and cannot occupy ${key}.`, key, moveId))
    }
    if (move.sourceType === 'Bloodline' && !equippedBloodlines.has(move.sourceName)) {
      issues.push(issue('unequipped-source', 'Error', `${move.name} comes from unequipped Bloodline ${move.sourceName}.`, key, moveId))
    }
    if (move.sourceType === 'Element' && !equippedElements.has(move.sourceName)) {
      issues.push(issue('unequipped-source', 'Error', `${move.name} comes from unequipped element ${move.sourceName}.`, key, moveId))
    }
    if (move.placement.category === 'CMode' && key !== 'C') issues.push(issue('wrong-mode-key', 'Error', `${move.name} is a C-mode and cannot occupy ${key}.`, key, moveId))
    if (move.placement.category === 'ZMode' && key !== 'Z') issues.push(issue('wrong-mode-key', 'Error', `${move.name} is a Z-mode and cannot occupy ${key}.`, key, moveId))
    if (move.requirements.modeRequired && ![variant.cMode, variant.zMode].some((mode) => mode.includes(move.requirements.modeRequired!))) {
      issues.push(issue('missing-required-mode', 'Error', `${move.name} requires ${move.requirements.modeRequired}, which is not active.`, key, moveId))
    }
    if (key === 'Q') {
      qSystems.add(move.sourceType)
      if (move.sourceType === 'Weapon' && move.sourceName !== variant.weapon) issues.push(issue('missing-q-system', 'Error', `${move.name} requires equipped weapon ${move.sourceName}.`, key, moveId))
      if (move.sourceType === 'Combat Art' && move.sourceName !== variant.combatArt) issues.push(issue('missing-q-system', 'Error', `${move.name} requires Combat Art ${move.sourceName}.`, key, moveId))
      if (move.sourceType === 'Kenjutsu' && move.sourceName !== (variant.kenjutsu ?? 'None')) issues.push(issue('missing-kenjutsu', 'Error', `${move.name} requires Kenjutsu ${move.sourceName}.`, key, moveId))
    }
  }

  if (bloodlineRowMoves > 3) issues.push(issue('bloodline-row-limit', 'Error', `The Bloodline row contains ${bloodlineRowMoves} moves; the maximum is three.`))
  if (qSystems.size > 1) issues.push(issue('q-conflict', 'Error', 'More than one active system is assigned to Q.'))

  for (const source of variant.bloodlines) {
    const modeContributes = variant.cMode.includes(source.name) || variant.zMode.includes(source.name)
    const carriedReason = profile.carriedSourceReasons[source.name]?.trim()
    if (!usedSources.has(source.name) && !modeContributes && !carriedReason) {
      issues.push(issue('unused-bloodline', 'Error', `${source.name} contributes no equipped move, mode, passive, or documented profile purpose.`))
    } else if (!usedSources.has(source.name) && !modeContributes && /supporting bloodline|adds versatility|helps the build|character match/i.test(carriedReason)) {
      issues.push(issue('unused-bloodline', 'Warning', `${source.name} has only a vague carried-slot purpose and is likely a wasted slot.`))
    } else if (!usedSources.has(source.name) && !modeContributes && /likely wasted slot/i.test(carriedReason)) {
      issues.push(issue('unused-bloodline', 'Warning', `${source.name} is flagged as a likely wasted slot pending an owner decision.`))
    }
  }
  for (const source of variant.elements) {
    if (!usedSources.has(source.name) && !profile.carriedSourceReasons[source.name]?.trim()) {
      issues.push(issue('unused-element', 'Warning', `${source.name} has no equipped move or documented purpose in this profile.`))
    }
  }

  const errors = issues.some((entry) => entry.severity === 'Error')
  const evidenceGaps = issues.some((entry) => entry.severity === 'Needs Evidence')
  return {
    // Structural legality and live mechanic verification are deliberately separate.
    // An unknown cooldown or guard property does not make a correctly placed loadout illegal.
    status: errors ? 'Invalid' : evidenceGaps ? 'Legal With Unverified Placement' : 'Game Legal',
    issues,
  }
}

export function sourceSupportsMode(sourceType: 'Bloodline' | 'Mode', sourceName: string, key: 'C' | 'Z') {
  const source = shindoSourceByName.get(`${sourceType}\u0000${sourceName}`)
  return source?.modeSlot === key
}

function issue(code: HotbarLegalityIssue['code'], severity: HotbarLegalityIssue['severity'], message: string, key?: HotbarKey, moveId?: string): HotbarLegalityIssue {
  return { code, severity, message, key, moveId }
}
