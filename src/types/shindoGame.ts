export const SHINDO_GAME_VERSION = '249/249.5' as const

export type EvidenceSourceType =
  | 'Live Game'
  | 'Official RELL'
  | 'Roblox Listing'
  | 'Community Wiki'
  | 'Gameplay Showcase'
  | 'Community Discussion'

export type EvidenceConfidence = 'High' | 'Medium' | 'Low' | 'Unverified'
export type MechanicValue = boolean | 'Unverified'
export type ResourceValue = number | 'Unverified'
export type HotbarKey = '1' | '2' | '3' | '4' | '5' | 'T' | 'V' | 'B' | 'N' | 'C' | 'Z' | 'Q'
export type GeneralKey = '1' | '2' | '3' | '4' | '5' | 'T'
export type BloodlineKey = 'V' | 'B' | 'N'

export interface EvidenceRecord {
  id: string
  sourceType: EvidenceSourceType
  sourceTitle: string
  sourceReference: string
  revisionOrDate: string
  checkedAt: string
  claim: string
  confidence: EvidenceConfidence
  conflictNotes: string
}

export interface ShindoMoveRecord {
  id: string
  name: string
  sourceId: string
  sourceName: string
  sourceType: 'Bloodline' | 'Element' | 'Sub Ability' | 'Combat Art' | 'Kenjutsu' | 'Weapon' | 'Mode'
  moveIndex?: 1 | 2 | 3
  gameVersion: typeof SHINDO_GAME_VERSION
  placement: {
    category: 'BloodlineRow' | 'ElementRow' | 'CMode' | 'ZMode' | 'WeaponQ' | 'CombatArtQ' | 'PassiveSpec'
    allowedKeys: HotbarKey[]
    flexiblePlacement: boolean
    flexibilityEvidence: string[]
  }
  mechanics: {
    mobility: MechanicValue
    autoDodge: MechanicValue
    counter: MechanicValue
    iframe: MechanicValue
    blockBreak: MechanicValue
    guardPressure: MechanicValue
    placeLock: MechanicValue
    stun: MechanicValue
    ragdoll: MechanicValue
    knockback: MechanicValue
    pull: MechanicValue
    launcher: MechanicValue
    aerialRequirement: MechanicValue
    comboStarter: MechanicValue
    comboExtender: MechanicValue
    comboFinisher: MechanicValue
  }
  requirements: {
    modeRequired: string | null
    weaponRequired: string | null
    airborneRequired: MechanicValue
  }
  resource: {
    chi: ResourceValue
    stamina: ResourceValue
    modeDrain: ResourceValue
    cooldownSeconds: ResourceValue
  }
  evidence: EvidenceRecord[]
  status: 'Verified' | 'Strong Evidence' | 'Conflicting' | 'Unverified'
}

export interface ShindoSourceRecord {
  id: string
  name: string
  type: Exclude<ShindoMoveRecord['sourceType'], 'Sub Ability'>
  family: string
  baseSourceId: string | null
  modeSlot: 'C' | 'Z' | 'None'
  movesCanUseElementRow: boolean | 'Unverified'
  modeChangesM1: MechanicValue
  modeChangesQ: MechanicValue
  createsWeapon: MechanicValue
  changesAvatar: MechanicValue
  moveIds: string[]
  evidence: EvidenceRecord[]
}

export interface ShindoItemRecord {
  id: string
  name: string
  type: 'Combat Art' | 'Kenjutsu' | 'Weapon' | 'Ninja Tool' | 'Consumable' | 'Mentor' | 'Race'
  gameVersion: typeof SHINDO_GAME_VERSION
  evidence: EvidenceRecord[]
  status: 'Strong Evidence' | 'Unverified'
}

export type HotbarLegalityStatus = 'Game Legal' | 'Legal With Unverified Placement' | 'Invalid' | 'Needs Live Test'
export type OwnerTestingStatus = 'Not tested' | 'Placement confirmed' | 'Behavior confirmed' | 'Combo partially tested' | 'Verified for 249/249.5'

export interface PreparedHotbarProfile {
  variantId: string
  slots: Record<HotbarKey, string | null>
  carriedSourceReasons: Record<string, string>
  legalityStatus: HotbarLegalityStatus
  ownerTestingStatus: OwnerTestingStatus
  researchedGameVersion: typeof SHINDO_GAME_VERSION
}

export interface HotbarLegalityIssue {
  code:
    | 'invalid-key'
    | 'unknown-move'
    | 'wrong-row'
    | 'bloodline-row-limit'
    | 'unequipped-source'
    | 'duplicate-move'
    | 'wrong-mode-key'
    | 'empty-mode'
    | 'missing-q-system'
    | 'missing-kenjutsu'
    | 'missing-required-mode'
    | 'mode-conflict'
    | 'q-conflict'
    | 'unused-bloodline'
    | 'unused-element'
    | 'element-slot-limit'
  severity: 'Error' | 'Needs Evidence' | 'Warning'
  key?: HotbarKey
  moveId?: string
  message: string
}

export interface HotbarLegalityResult {
  status: HotbarLegalityStatus
  issues: HotbarLegalityIssue[]
}
