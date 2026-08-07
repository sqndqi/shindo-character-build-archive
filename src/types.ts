import type { HotbarKey } from './types/shindoGame'

export type BuildStatus = 'Complete' | 'Draft' | 'Needs Testing'
export type EffectsIntensity = 'Low' | 'Medium' | 'High' | 'Ridiculous'
export type TierRank = 'S+' | 'S' | 'A' | 'B' | 'C'
export type VerificationStatus = 'Current' | 'Needs Retesting' | 'Outdated' | 'Archived'
export type VariantVerificationStatus = 'Verified' | 'Needs Research' | 'Needs Retesting'
export type ConfidenceLabel = 'Verified' | 'Strong Match' | 'Approximation' | 'Competitive Substitute' | 'Unverified'
export type AccuracyClassification = 'Direct Match' | 'Strong Match' | 'Visual Approximation' | 'Competitive Substitute' | 'Unresolved'
export type MediaCategory = 'Manhwa' | 'Manga / Anime'

export type {
  CanonicalBuildDefinition,
  CanonicalBuildVariant,
  CanonicalEvidence,
  CanonicalGameCatalog,
  CanonicalHotbarSlot,
  CanonicalItem,
  CanonicalModeStage,
  CanonicalMove,
  CanonicalSource,
  CanonicalSourceCategory,
} from './types/canonicalBuild'

export type { HotbarKey } from './types/shindoGame'

export interface ElementSlot {
  name: string
  exactMovesUsed: string[]
  purpose: string
  replacements: string[]
}

export interface FidelityScores {
  visual: number
  ability: number
  fighting: number
  weapon: number
  movement: number
}

export interface BloodlineSlot {
  id?: string
  name: string
  purpose: string
  useMode: boolean
  exactMovesUsed?: string[]
  reason?: string
  represents?: string
  replacements?: { lore: string[]; competitive: string[]; accessible: string[] }
  evidence?: string[]
  verificationStatus?: 'verified' | 'needs-research' | 'unresolved'
}

export type HotbarRoleTag =
  | 'starter'
  | 'combo-extender'
  | 'combo-ender'
  | 'guard-break'
  | 'counter'
  | 'evasive'
  | 'movement'
  | 'ranged-pressure'
  | 'area-control'
  | 'defensive-utility'
  | 'healing'
  | 'transformation'
  | 'signature'

export type SlotResearchStatus =
  | 'verified'
  | 'owner-confirmed'
  | 'needs-retesting'
  | 'unresolved'
  | 'intentionally-unused'
  | 'alternative-for-viability'
  | 'alternative-for-accuracy'

export interface HotbarSlot {
  id: string
  key: HotbarKey
  ability: string
  source: string
  purpose: string
  comboRole: string
  blockBreak: boolean
  usageNotes: string
  characterAbility?: string
  counter?: boolean
  modeAbility?: boolean
  accuracy?: AccuracyClassification
  sourceType?: 'Bloodline' | 'Element' | 'Sub-Ability' | 'Mode' | 'Weapon' | 'Combat Art' | 'Kenjutsu' | 'None'
  mobility?: boolean
  guardPressure?: boolean
  modeRequirement?: string
  testingStatus?: 'Untested' | 'Needs Retesting' | 'Works' | 'Verified for update'
  resourceNotes?: string
  canonicalMoveId?: string
  emptyReason?: 'Intentionally unused' | 'No accurate option' | 'Placement unverified' | 'Requires owner testing' | 'Reserved for player preference'
  roleTags?: HotbarRoleTag[]
  researchStatus?: SlotResearchStatus
  evidenceNote?: string
  sourceId?: string
}

export interface Combo {
  name: string
  sequence: HotbarKey[]
  explanation: string
}

export interface BuildEvidence {
  category: 'Character' | 'Game' | 'Testing'
  claim: string
  sourceTitle: string
  sourceReference: string
  checkedAt: string
  notes: string
}

export interface BuildVariant {
  id: string
  name: string
  type: 'Primary' | 'Lore Accurate' | 'Competitive' | 'Beginner' | 'Owned Items' | 'Two Slot' | 'Three Slot' | 'Four Slot'
  bloodlineSlotCount: 2 | 3 | 4
  elementSlotCount: 2 | 3 | 4
  bloodlines: BloodlineSlot[]
  elements: ElementSlot[]
  cMode: string
  zMode: string
  combatArt: string
  combatArtReason?: string
  kenjutsu?: string
  kenjutsuReason?: string
  weapon: string
  weaponReason?: string
  qAction?: {
    source: 'Weapon' | 'Combat Art' | 'Kenjutsu' | 'None'
    name: string
    purpose: string
  }
  fightingStyleNotes?: string[]
  ninjaTool: string
  consumable: string
  mentor: string
  race: string
  equipment?: {
    ninjaTool: string
    ninjaToolReason: string
    consumable: string
    consumableReason: string
    mentor: string
    mentorReason: string
    race: string
    raceReason: string
  }
  hotbar: HotbarSlot[]
  combos: Combo[]
  ratings: CharacterBuild['ratings']
  strengths: string[]
  weaknesses: string[]
  usageGuide: string[]
  ownershipRequirements?: string[]
  compromises?: string[]
  verificationStatus: VariantVerificationStatus
  lastVerifiedUpdate: string
  preparedHotbarProfileId?: string
  hotbarLegalityStatus?: import('./types/shindoGame').HotbarLegalityStatus
  ownerTestingStatus?: import('./types/shindoGame').OwnerTestingStatus
  researchedGameVersion?: string
  profilePurpose?: 'Identity Build' | 'Game-Legal Build' | 'Two-Slot Build' | 'Three-Slot Build' | 'Accessible Build' | 'Competitive Build'
  carriedSourceReasons?: Record<string, string>
  moveBankPlan?: {
    moveId: string
    replacesKey: string
    situation: string
    accuracy: AccuracyClassification
    liveTested: boolean
  }[]
  canonicalDefinition?: import('./types/canonicalBuild').CanonicalBuildVariant

  // Phase 4C: mode detail
  primaryMode?: string
  submode?: string
  modeStage?: string
  modeActivationKey?: string
  modeCompatibilityWarning?: string
  simultaneousModeLegality?: 'legal' | 'illegal' | 'untested'

  // Phase 4C: tactical plan
  statsAllocation?: Record<string, number>
  opener?: string[]
  mainCombo?: string[]
  alternateCombo?: string[]
  escapeRoute?: string[]
  neutralGamePlan?: string
  modeRecommendation?: string
  submodeRecommendation?: string

  // Phase 4C: research and resemblance
  researcherNotes?: string
  visualResemblance?: number
  targetShindoUpdate?: string

  // Phase B: extended loadout metadata
  arcVersion?: string
  sourceChapterRange?: string
  buildIntent?: 'Accuracy-First' | 'Balanced' | 'PvP-First' | 'Accessible'
  fidelityScores?: FidelityScores
  companion?: string
  companionReason?: string
}

export interface CharacterBuild {
  id: string
  characterId: string
  versionId: string
  buildName: string
  name: string
  series: string
  franchise: string
  media?: MediaCategory
  version: string
  image: string
  thumbnail?: string
  description: string
  archetype: string[]
  combatTags: string[]
  customTags: string[]
  effectsIntensity: EffectsIntensity
  bloodlines: BloodlineSlot[]
  elements: string[]
  cMode: string
  zMode: string
  combatArt: string
  weapon: string
  ninjaTool: string
  consumable: string
  mentor: string
  race: string
  hotbar: HotbarSlot[]
  combos: Combo[]
  strengths: string[]
  weaknesses: string[]
  substitutions: string[]
  ratings: {
    accuracy: number
    pvp: number
    mobility: number
    combos: number
    defense: number
    visuals: number
    aura: number
    difficulty: number
  }
  slotAlternatives: {
    twoSlots: string[]
    threeSlots: string[]
    fourSlots: string[]
  }
  variations: {
    beginner: string
    meta: string
    lore: string
  }
  notes: string
  status: BuildStatus
  gameUpdate: string
  lastVerifiedUpdate: string
  verificationStatus: VerificationStatus
  createdAt: string
  updatedAt: string
  testing: {
    status: 'Tested' | 'Untested' | 'Works' | 'Needs Changes'
    contexts: ('Arena' | 'Ranked')[]
    tester: string
    testDate: string
    notes: string
  }
  changeHistory: {
    field: string
    previousValue: string
    newValue: string
    date: string
    reason?: string
  }[]
  chapterRange: string
  characterAbilities: string[]
  knownCompromises: string[]
  confidence: ConfidenceLabel
  publicationStatus: 'Reviewed' | 'Draft' | 'Needs Research' | 'Needs Retesting'
  variants: BuildVariant[]
  evidence: BuildEvidence[]

  // Phase B: top-level loadout summary fields (mirrors primary variant for quick access)
  kenjutsu?: string
  submode?: string
  companion?: string
  elementSlots?: ElementSlot[]
}

export type SlotLimit = 2 | 3 | 4

export interface Character {
  id: string
  name: string
  aliases: string[]
  series: string
  image: string
  thumbnail?: string
  description: string
  tags: string[]
}

export interface CharacterVersion {
  id: string
  characterId: string
  versionName: string
  arc: string
  chapterRange: string
  imageOverride?: string
  notes: string
}

export interface Build {
  id: string
  characterVersionId: string
  buildName: string
  gameUpdate: string
  bloodlines: BloodlineSlot[]
  elements: string[]
  cMode: string
  zMode: string
  combatArt: string
  weapon: string
  hotbar: HotbarSlot[]
  combos: Combo[]
  ratings: CharacterBuild['ratings']
  alternatives: CharacterBuild['variations']
  sourceNotes: string
  status: BuildStatus
  createdAt: string
  updatedAt: string
}
