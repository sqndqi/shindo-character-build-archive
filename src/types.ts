export type BuildStatus = 'Complete' | 'Draft' | 'Needs Testing'

export interface BloodlineSlot {
  name: string
  purpose: string
  useMode: boolean
}

export interface HotbarSlot {
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
  name: string
  series: string
  version: string
  image: string
  description: string
  archetype: string[]
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
}

export type SlotLimit = 2 | 3 | 4
