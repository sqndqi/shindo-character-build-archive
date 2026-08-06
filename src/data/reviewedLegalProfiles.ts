import type { BuildVariant, CharacterBuild, HotbarSlot } from '../types'
import { findShindoMove, shindoMoves } from './shindoGameData'
import { HOTBAR_KEYS, validatePreparedHotbar } from '../lib/hotbarLegality'
import { SHINDO_GAME_VERSION, type HotbarKey, type PreparedHotbarProfile, type ShindoMoveRecord } from '../types/shindoGame'

/**
 * This adapter is intentionally conservative. It does not infer flexible Bloodline placement:
 * Bloodline moves use V/B/N, elements use 1–5/T, modes use C/Z, and one equipped system may use Q.
 * Editorial source choices remain outside this adapter; the canonical game catalog controls placement.
 */
export function applyReviewedLegalProfiles(builds: CharacterBuild[]): CharacterBuild[] {
  return builds.map((build) => ({
    ...build,
    variants: build.variants.map((variant) => applyProfile(variant)),
  }))
}

export function createConservativeProfile(variant: BuildVariant): PreparedHotbarProfile {
  const current = variant.hotbar
    .map((slot) => findShindoMove(slot.source, slot.ability))
    .filter((move): move is ShindoMoveRecord => Boolean(move))

  const elementMoves = uniqueMoves([
    ...current.filter((move) => move.sourceType === 'Element' && variant.elements.some((element) => element.name === move.sourceName)),
    ...variant.elements.flatMap((element) => element.exactMovesUsed.map((name) => findShindoMove(element.name, name))).filter(isMove),
  ]).slice(0, 6)

  const bloodlineMoves = uniqueMoves([
    ...current.filter((move) => move.sourceType === 'Bloodline' && variant.bloodlines.some((bloodline) => bloodline.name === move.sourceName)),
    ...variant.bloodlines.flatMap((bloodline) => bloodline.exactMovesUsed.map((name) => findShindoMove(bloodline.name, name))).filter(isMove),
  ]).slice(0, 3)

  const cMode = modeMove(variant.cMode, 'C')
  const zMode = modeMove(variant.zMode, 'Z')
  const qMove = qActionMove(variant)
  const slots = Object.fromEntries(HOTBAR_KEYS.map((key) => [key, null])) as Record<HotbarKey, string | null>
  ;(['1', '2', '3', '4', '5', 'T'] as HotbarKey[]).forEach((key, index) => { slots[key] = elementMoves[index]?.id ?? null })
  ;(['V', 'B', 'N'] as HotbarKey[]).forEach((key, index) => { slots[key] = bloodlineMoves[index]?.id ?? null })
  slots.C = cMode?.id ?? null
  slots.Z = zMode?.id ?? null
  slots.Q = qMove?.id ?? null

  const usedSources = new Set(Object.values(slots).filter(Boolean).map((id) => shindoMoves.find((move) => move.id === id)?.sourceName))
  const carriedSourceReasons = variant.carriedSourceReasons ?? Object.fromEntries([
    ...variant.bloodlines.filter((source) => !usedSources.has(source.name)).map((source) => {
      const available = shindoMoves.filter((move) => move.sourceType === 'Bloodline' && move.sourceName === source.name)
      if (available.length) return [source.name, `Move-bank alternative: ${available.map((move) => move.name).join(', ')} remain available, but are not equipped in this profile.`]
      if (source.useMode && variant.cMode.includes(source.name)) return [source.name, `Active C-mode: ${variant.cMode}.`]
      if (source.useMode && variant.zMode.includes(source.name)) return [source.name, `Active Z-mode: ${variant.zMode}.`]
      if (variant.type === 'Competitive') return [source.name, `Competitive profile option: ${source.reason || source.purpose}`]
      return [source.name, `Likely wasted slot — owner decision required. No active move, mode, passive, or documented spec is available for ${source.name}.`]
    }),
    ...variant.elements.filter((source) => !usedSources.has(source.name)).map((source) => [source.name, `Reserved for player preference: ${source.purpose}`]),
  ])
  const provisional: PreparedHotbarProfile = {
    variantId: variant.id,
    slots,
    carriedSourceReasons,
    legalityStatus: 'Game Legal',
    ownerTestingStatus: 'Not tested',
    researchedGameVersion: SHINDO_GAME_VERSION,
  }
  provisional.legalityStatus = validatePreparedHotbar(variant, provisional).status
  return provisional
}

function applyProfile(variant: BuildVariant): BuildVariant {
  const profile = createConservativeProfile(variant)
  const previousByMove = new Map(variant.hotbar.map((slot) => [`${slot.source}\u0000${slot.ability}`, slot]))
  const hotbar = HOTBAR_KEYS.map((key) => materializeSlot(variant, key, profile.slots[key], previousByMove))
  const activeKeys = new Set(hotbar.filter((slot) => slot.sourceType !== 'None').map((slot) => slot.key))
  const combos = variant.combos
    .map((combo) => ({ ...combo, sequence: combo.sequence.filter((key) => activeKeys.has(key as import('../types/shindoGame').HotbarKey)) }))
    .filter((combo) => combo.sequence.length >= 2)
    .filter((combo) => combo.sequence.join('') !== '12345')
    .map((combo) => ({
      ...combo,
      explanation: `${combo.explanation.replace(/guaranteed/gi, 'expected')} Live timing and escape windows remain unverified for ${SHINDO_GAME_VERSION}.`,
    }))

  return {
    ...variant,
    hotbar,
    combos,
    preparedHotbarProfileId: profile.variantId,
    hotbarLegalityStatus: profile.legalityStatus,
    ownerTestingStatus: profile.ownerTestingStatus,
    researchedGameVersion: profile.researchedGameVersion,
    lastVerifiedUpdate: `Researched for ${SHINDO_GAME_VERSION}; live test pending`,
  }
}

function materializeSlot(variant: BuildVariant, key: HotbarKey, moveId: string | null, previousByMove: Map<string, HotbarSlot>): HotbarSlot {
  if (!moveId) {
    const empty = emptyControlState(variant, key)
    return {
      id: `${variant.id}-legal-${key}`,
      key,
      ability: empty.reason,
      source: 'None',
      purpose: empty.explanation,
      comboRole: 'Empty',
      blockBreak: false,
      usageNotes: empty.explanation,
      sourceType: 'None',
      modeAbility: false,
      testingStatus: 'Untested',
      accuracy: 'Unresolved',
      emptyReason: empty.reason,
    }
  }
  const move = shindoMoves.find((entry) => entry.id === moveId)!
  const prior = previousByMove.get(`${move.sourceName}\u0000${move.name}`)
  const isMode = move.sourceType === 'Mode'
  const sourceType = move.sourceType === 'Sub Ability' ? 'Sub-Ability' : move.sourceType
  const researchedRole = move.name === 'Fist Style: 6th Dance'
    ? 'Aerial starter · unverified'
    : move.name === 'Fist Style: 9th Dance'
      ? 'Aerial extender · unverified'
      : move.mechanics.launcher === true
    ? move.mechanics.aerialRequirement === true ? 'Aerial extender' : 'Aerial starter'
    : prior?.comboRole ?? (isMode ? 'Mode' : 'Utility')
  return {
    id: `${variant.id}-legal-${key}`,
    key,
    ability: move.name,
    source: move.sourceName,
    purpose: cleanEditorial(prior?.purpose) ?? `Equipped from ${move.sourceName}; character mapping is documented in the source choice.`,
    comboRole: researchedRole,
    blockBreak: move.mechanics.blockBreak === true,
    guardPressure: move.mechanics.guardPressure === true,
    counter: move.mechanics.counter === true ? true : undefined,
    mobility: move.mechanics.mobility === true ? true : undefined,
    modeAbility: isMode,
    accuracy: prior?.accuracy ?? 'Unresolved',
    sourceType,
    testingStatus: 'Untested',
    modeRequirement: move.requirements.modeRequired ?? 'None',
    usageNotes: `Placement follows the canonical ${move.placement.category} rule. Combat behavior remains ${move.status === 'Unverified' ? 'unverified' : 'research-supported'} until an owner live test.`,
    characterAbility: cleanEditorial(prior?.characterAbility) ?? cleanEditorial(prior?.purpose) ?? 'Character mapping requires editorial review.',
    resourceNotes: 'Cooldown and resource values are not shown without current corroboration.',
    canonicalMoveId: move.id,
  }
}

function emptyControlState(variant: BuildVariant, key: HotbarKey): { reason: NonNullable<HotbarSlot['emptyReason']>; explanation: string } {
  if (key === 'C') {
    return /^(none|no c-mode)/i.test(variant.cMode)
      ? { reason: 'Intentionally unused', explanation: 'This profile intentionally avoids a C-mode.' }
      : { reason: 'Placement unverified', explanation: `The listed C-mode (${variant.cMode}) does not yet have a confirmed canonical placement record.` }
  }
  if (key === 'Z') {
    return /^(none|no z-mode)/i.test(variant.zMode)
      ? { reason: 'No accurate option', explanation: 'No prepared Z-mode accurately fits this profile.' }
      : { reason: 'Requires owner testing', explanation: `The listed Z-mode (${variant.zMode}) requires an owner placement test before activation is recommended.` }
  }
  if (key === 'Q') {
    const hasSystem = variant.weapon !== 'None' || variant.combatArt !== 'None' || (variant.kenjutsu ?? 'None') !== 'None'
    return hasSystem
      ? { reason: 'Requires owner testing', explanation: 'The equipped fighting system has no confirmed canonical Q-action record yet.' }
      : { reason: 'Reserved for player preference', explanation: 'No weapon or Combat Art Q action is required; this control is left to player preference.' }
  }
  if (['V', 'B', 'N'].includes(key)) return { reason: 'No accurate option', explanation: 'No additional researched Bloodline move is accurate enough for this Bloodline-row control.' }
  if (key === 'T') return { reason: 'Reserved for player preference', explanation: 'This flexible general control is left open for the player’s preferred utility.' }
  return { reason: 'Intentionally unused', explanation: 'This profile does not need another general-row move and avoids filler.' }
}

function modeMove(label: string, key: 'C' | 'Z') {
  if (/^(none|no z-mode)/i.test(label)) return undefined
  const exact = shindoMoves.find((move) => move.sourceType === 'Mode' && move.name === label && move.placement.allowedKeys.includes(key))
  if (exact) return exact
  const source = label.split(' — ')[0]
  return shindoMoves.find((move) => move.sourceType === 'Mode' && move.sourceName === source && move.placement.allowedKeys.includes(key))
}

function qActionMove(variant: BuildVariant) {
  if (variant.qAction?.source === 'None') return undefined
  if (variant.weapon !== 'None') return shindoMoves.find((move) => move.sourceType === 'Weapon' && move.sourceName === variant.weapon)
  if (variant.combatArt !== 'None') return shindoMoves.find((move) => move.sourceType === 'Combat Art' && move.sourceName === variant.combatArt)
  return undefined
}

function isMove(move: ShindoMoveRecord | undefined): move is ShindoMoveRecord {
  return Boolean(move)
}

function uniqueMoves(moves: ShindoMoveRecord[]) {
  return [...new Map(moves.map((move) => [move.id, move])).values()]
}

function cleanEditorial(value?: string) {
  if (!value || /reviewed supporting match|exact source is authored/i.test(value)) return undefined
  return value
}
