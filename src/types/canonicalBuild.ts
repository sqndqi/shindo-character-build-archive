import type { HotbarKey, MechanicValue, ResourceValue } from './shindoGame'

export const CANONICAL_BUILD_SCHEMA_VERSION = 'archive-canonical-build/v1' as const

export type CanonicalSourceCategory =
  | 'Bloodline'
  | 'Element'
  | 'Sub-Ability'
  | 'Taijutsu'
  | 'Genjutsu'
  | 'Medical'
  | 'C-Mode'
  | 'Z-Mode'
  | 'Sub-Mode'
  | 'Combat Art'
  | 'Kenjutsu'
  | 'Weapon'
  | 'Ninja Tool'
  | 'Consumable'
  | 'Companion'
  | 'Mentor'
  | 'Race'

export type CanonicalPlacementCategory =
  | 'GeneralRow'
  | 'BloodlineRow'
  | 'ElementRow'
  | 'CMode'
  | 'ZMode'
  | 'SubMode'
  | 'WeaponQ'
  | 'CombatArtQ'
  | 'KenjutsuQ'
  | 'PassiveSpec'
  | 'Companion'

export type CanonicalTestingStatus = 'Unverified' | 'Needs Owner Test' | 'Partially Tested' | 'Verified'
export type CanonicalPublicationStatus = 'Researching' | 'Mapped' | 'Awaiting Owner Test' | 'Reviewed'
export type CanonicalConfidence = 'High' | 'Medium' | 'Low' | 'Unverified'
export type MatchClassification = 'Direct Match' | 'Strong Match' | 'Visual Approximation' | 'Competitive Substitute'
export type EmptySlotReason = 'Intentionally unused' | 'No accurate option' | 'Placement unverified' | 'Requires owner testing' | 'Reserved for player preference'

export interface CanonicalEvidence {
  id: string
  claim: string
  sourceTitle: string
  sourceReference: string
  revisionOrDate: string
  checkedAt: string
  confidence: CanonicalConfidence
  notes: string
}

export interface CanonicalMoveMechanics {
  mobility: MechanicValue
  counter: MechanicValue
  autoDodge: MechanicValue
  iframe: MechanicValue
  blockBreak: MechanicValue
  guardPressure: MechanicValue
  placeLock: MechanicValue
  stun: MechanicValue
  ragdoll: MechanicValue
  pull: MechanicValue
  knockback: MechanicValue
  comboStarter: MechanicValue
  comboExtender: MechanicValue
  comboFinisher: MechanicValue
}

export interface CanonicalMove {
  id: string
  name: string
  sourceId: string
  sourceCategory: CanonicalSourceCategory
  legalKeys: HotbarKey[]
  placementCategory: CanonicalPlacementCategory
  flexiblePlacement: MechanicValue
  represents: string
  mechanics: CanonicalMoveMechanics
  requirements: {
    modeSourceId: string | null
    weaponSourceId: string | null
  }
  resource: {
    chi: ResourceValue
    stamina: ResourceValue
    modeDrain: ResourceValue
    cooldownSeconds: ResourceValue
  }
  evidence: CanonicalEvidence[]
  confidence: CanonicalConfidence
  testingStatus: CanonicalTestingStatus
  gameVersion: string
}

export interface CanonicalModeStage {
  id: string
  sourceId: string
  stage: number | 'Unverified'
  slot: 'C' | 'Z' | 'Sub-Mode'
  changesM1: MechanicValue
  changesQ: MechanicValue
  changesAppearance: MechanicValue
  createsOrChangesWeapon: MechanicValue
  specMoveIds: string[]
  passiveMoveIds: string[]
  qMoveId: string | null
  evidence: CanonicalEvidence[]
  testingStatus: CanonicalTestingStatus
}

export interface CanonicalSource {
  id: string
  name: string
  category: CanonicalSourceCategory
  family: string
  baseSourceId: string | null
  moveIds: string[]
  modeStageIds: string[]
  evidence: CanonicalEvidence[]
  confidence: CanonicalConfidence
  testingStatus: CanonicalTestingStatus
}

export interface CanonicalItem {
  id: string
  sourceId: string
  name: string
  category: Extract<CanonicalSourceCategory, 'Combat Art' | 'Kenjutsu' | 'Weapon' | 'Ninja Tool' | 'Consumable' | 'Companion' | 'Mentor' | 'Race'>
  appearanceNotes: string
  qMoveId: string | null
  passiveMoveIds: string[]
  requirements: string[]
  evidence: CanonicalEvidence[]
  confidence: CanonicalConfidence
  testingStatus: CanonicalTestingStatus
}

export interface CanonicalGameCatalog {
  schemaVersion: typeof CANONICAL_BUILD_SCHEMA_VERSION
  gameVersion: string
  sources: CanonicalSource[]
  moves: CanonicalMove[]
  modeStages: CanonicalModeStage[]
  items: CanonicalItem[]
}

export interface CanonicalSourceSelection {
  sourceId: string
  category: CanonicalSourceCategory
  selectedMoveIds: string[]
  purpose: string
  match: MatchClassification
  rejectedAlternatives: string[]
}

export interface CanonicalHotbarSlot {
  key: HotbarKey
  moveId: string | null
  emptyReason?: EmptySlotReason
  notes: string
}

export interface CanonicalBuildVariant {
  id: string
  name: string
  slotProfile: 2 | 3 | 4 | 'Accessible' | 'Competitive' | 'Alternate Element'
  bloodlineSlotCount: 2 | 3 | 4
  elementSlotCount: 2 | 3 | 4
  sourceSelections: CanonicalSourceSelection[]
  activeModes: { sourceId: string; stageId: string; slot: 'C' | 'Z' | 'Sub-Mode'; conflictNotes: string }[]
  weapon: { sourceId: string | null; qMoveId: string | null; decision: string }
  kenjutsu: {
    sourceId: string | null
    qMoveId: string | null
    decision: 'Recommended Kenjutsu' | 'Weapon-only setup' | 'Bloodline replaces Kenjutsu' | 'No accurate Kenjutsu exists' | 'Competitive Kenjutsu alternative'
    reason: string
  }
  equipment: {
    ninjaTool: { sourceId: string | null; decision: string }
    consumable: { sourceId: string | null; decision: string }
    companion: { sourceId: string | null; decision: string }
    mentor: { sourceId: string | null; decision: string }
    race: { sourceId: string | null; decision: string }
  }
  hotbar: CanonicalHotbarSlot[]
  moveBank: { moveId: string; replacesKey: HotbarKey; situation: string }[]
  replacements: { replacedId: string; replacementId: string; reason: string }[]
  ownershipRequirements: string[]
  compromises: string[]
  strengths: string[]
  weaknesses: string[]
  combos: { routeType: 'Neutral' | 'Guard Pressure' | 'Counter/Reversal' | 'Low Resource' | 'Escape' | 'Mode'; name: string; moveIds: string[]; explanation: string; caveat: string }[]
  usageGuide: string[]
  authorship: {
    method: 'Manual'
    derivedFromVariantId: null
    independentReviewNotes: string
  }
  confidence: CanonicalConfidence
  testingStatus: CanonicalTestingStatus
  publicationStatus: Exclude<CanonicalPublicationStatus, 'Reviewed'>
  ratings: { accuracy: number; pvp: number }
  researchCompleteness: number
  declaredLegality: 'Valid' | 'Valid With Evidence Gaps' | 'Invalid'
}

export interface CanonicalBuildDefinition {
  schemaVersion: typeof CANONICAL_BUILD_SCHEMA_VERSION
  id: string
  characterId: string
  characterVersionId: string
  gameVersion: string
  variants: CanonicalBuildVariant[]
}
