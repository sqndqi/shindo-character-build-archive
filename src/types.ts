export type BuildStatus = 'Complete' | 'Draft' | 'Needs Testing'
export type EffectsIntensity = 'Low' | 'Medium' | 'High' | 'Ridiculous'
export type TierRank = 'S+' | 'S' | 'A' | 'B' | 'C'
export type VerificationStatus = 'Current' | 'Needs Retesting' | 'Outdated' | 'Archived'

export interface BloodlineSlot {
  id: string
  name: string
  purpose: string
  useMode: boolean
}

export interface HotbarSlot {
  id: string
  key: string
  ability: string
  source: string
  purpose: string
  comboRole: string
  blockBreak: boolean
  usageNotes: string
}

export interface Combo {
  name: string
  sequence: string[]
  explanation: string
}

export interface CharacterBuild {
  id: string
  characterId: string
  versionId: string
  buildName: string
  name: string
  series: string
  franchise: string
  version: string
  image: string
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
}

export type SlotLimit = 2 | 3 | 4

export interface Character {
  id: string
  name: string
  aliases: string[]
  series: string
  image: string
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
