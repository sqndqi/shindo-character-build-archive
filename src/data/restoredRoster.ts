import type { BuildVariant, CharacterBuild, HotbarSlot } from '../types'
import { originalCharacters } from './characters'
import { curatedBuilds } from './curatedBuilds'
import { animeMangaBuilds } from './animeMangaBuilds'

const curatedIds = new Set(curatedBuilds.map((build) => build.id))
const hotbarKeys = ['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q']

function unresolvedHotbar(id: string): HotbarSlot[] {
  return hotbarKeys.map((key) => ({
    id: `${id}-unresolved-${key}`,
    key,
    ability: 'Unresolved — research required',
    source: 'Research pending',
    purpose: 'This slot is intentionally unresolved until a real current-update ability is reviewed.',
    comboRole: 'Unresolved',
    blockBreak: false,
    usageNotes: 'Not presented as an exact or tested move.',
  }))
}

function publicationStatus(build: CharacterBuild): CharacterBuild['publicationStatus'] {
  if (!build.image) return 'Needs Research'
  if (build.status === 'Needs Testing') return 'Needs Retesting'
  return 'Draft'
}

function toDraft(build: CharacterBuild): CharacterBuild {
  const status = publicationStatus(build)
  const bloodlineSlotCount = Math.max(2, Math.min(4, build.bloodlines.length)) as 2 | 3 | 4
  const elementSlotCount = Math.max(2, Math.min(4, build.elements.length)) as 2 | 3 | 4
  const draftHotbar = unresolvedHotbar(build.id)
  const variant: BuildVariant = {
    id: `${build.id}-restored-draft`,
    name: 'Restored early draft',
    type: 'Primary',
    bloodlineSlotCount,
    elementSlotCount,
    bloodlines: build.bloodlines.slice(0, bloodlineSlotCount).map((slot) => ({
      name: slot.name,
      purpose: slot.purpose,
      exactMovesUsed: [],
      useMode: slot.useMode,
      reason: slot.purpose,
      represents: slot.purpose,
      replacements: { lore: [], competitive: [], accessible: [] },
    })),
    elements: build.elements.slice(0, elementSlotCount).map((name) => ({
      name,
      exactMovesUsed: [],
      purpose: 'Existing draft element recommendation; exact moves still require research.',
      replacements: [],
    })),
    cMode: build.cMode,
    zMode: build.zMode,
    combatArt: build.combatArt,
    weapon: build.weapon,
    ninjaTool: build.ninjaTool,
    consumable: build.consumable,
    mentor: build.mentor,
    race: build.race,
    hotbar: draftHotbar,
    combos: [],
    ratings: build.ratings,
    strengths: build.strengths,
    weaknesses: [...build.weaknesses, 'Exact move selection and combo timing are not yet verified.'],
    usageGuide: ['Use the Bloodline, element, mode, Combat Art, and weapon recommendations as an early concept only.', 'Wait for a reviewed variant before treating any hotbar or combo route as exact.'],
    verificationStatus: 'Needs Research',
    lastVerifiedUpdate: 'Not yet verified',
  }
  return {
    ...build,
    thumbnail: build.image ? `/characters/thumbs/${build.id}.webp` : '',
    hotbar: draftHotbar,
    combos: [],
    notes: 'This build is available as an early draft and is still being researched for exact move accuracy.',
    chapterRange: build.chapterRange || 'Needs research',
    characterAbilities: build.archetype,
    knownCompromises: ['Exact moves, resource costs, and combo timing are unresolved.'],
    confidence: 'Unverified',
    publicationStatus: status,
    variants: [variant],
    evidence: [],
  }
}

export const restoredDraftBuilds = originalCharacters.filter((build) => !curatedIds.has(build.id)).map(toDraft)
export const completeRoster = [...curatedBuilds, ...animeMangaBuilds, ...restoredDraftBuilds]
