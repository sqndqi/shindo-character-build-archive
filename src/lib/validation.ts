import { z } from 'zod'

const bloodlineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string(),
  useMode: z.boolean(),
})

const hotbarSchema = z.object({
  id: z.string().min(1),
  key: z.enum(['1', '2', '3', '4', '5', 'T', 'V', 'B', 'N', 'C', 'Z', 'Q']),
  ability: z.string(),
  source: z.string(),
  purpose: z.string(),
  comboRole: z.string(),
  blockBreak: z.boolean(),
  usageNotes: z.string(),
  sourceType: z.enum(['Bloodline', 'Element', 'Sub-Ability', 'Mode', 'Weapon', 'Combat Art', 'Kenjutsu', 'None']).optional(),
  testingStatus: z.enum(['Untested', 'Needs Retesting', 'Works', 'Verified for update']).optional(),
  roleTags: z.array(z.enum(['starter', 'combo-extender', 'combo-ender', 'guard-break', 'counter', 'evasive', 'movement', 'ranged-pressure', 'area-control', 'defensive-utility', 'healing', 'transformation', 'signature'])).optional(),
  researchStatus: z.enum(['verified', 'owner-confirmed', 'needs-retesting', 'unresolved', 'intentionally-unused', 'alternative-for-viability', 'alternative-for-accuracy']).optional(),
  evidenceNote: z.string().optional(),
}).passthrough()

const fightingEquipmentSchema = z.object({
  ninjaTool: z.string(),
  ninjaToolReason: z.string(),
  consumable: z.string(),
  consumableReason: z.string(),
  mentor: z.string(),
  mentorReason: z.string(),
  race: z.string(),
  raceReason: z.string(),
})

const variantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bloodlineSlotCount: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  elementSlotCount: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  combatArt: z.string(),
  combatArtReason: z.string().optional(),
  kenjutsu: z.string().optional(),
  kenjutsuReason: z.string().optional(),
  weapon: z.string(),
  weaponReason: z.string().optional(),
  qAction: z.object({
    source: z.enum(['Weapon', 'Combat Art', 'Kenjutsu', 'None']),
    name: z.string(),
    purpose: z.string(),
  }).optional(),
  equipment: fightingEquipmentSchema.optional(),
  hotbar: z.array(hotbarSchema),
  primaryMode: z.string().optional(),
  submode: z.string().optional(),
  modeStage: z.string().optional(),
  modeActivationKey: z.string().optional(),
  modeCompatibilityWarning: z.string().optional(),
  simultaneousModeLegality: z.enum(['legal', 'illegal', 'untested']).optional(),
  statsAllocation: z.record(z.string(), z.number()).optional(),
  opener: z.array(z.string()).optional(),
  mainCombo: z.array(z.string()).optional(),
  alternateCombo: z.array(z.string()).optional(),
  escapeRoute: z.array(z.string()).optional(),
  neutralGamePlan: z.string().optional(),
  modeRecommendation: z.string().optional(),
  submodeRecommendation: z.string().optional(),
  researcherNotes: z.string().optional(),
  visualResemblance: z.number().min(0).max(10).optional(),
  targetShindoUpdate: z.string().optional(),
}).passthrough()

export const buildSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  series: z.string().min(1),
  version: z.string().min(1),
  image: z.string(),
  bloodlines: z.array(bloodlineSchema).max(4),
  elements: z.array(z.string()).max(2),
  hotbar: z.array(hotbarSchema),
  variants: z.array(variantSchema).optional(),
  ratings: z.object({
    accuracy: z.number().min(0).max(10),
    pvp: z.number().min(0).max(10),
    mobility: z.number().min(0).max(10),
    combos: z.number().min(0).max(10),
    defense: z.number().min(0).max(10),
    visuals: z.number().min(0).max(10),
    aura: z.number().min(0).max(10),
    difficulty: z.number().min(0).max(10),
  }),
}).passthrough()

export type ValidationResult = ReturnType<typeof buildSchema.safeParse>

// All names from the removed abilityNames object in characters.ts are quarantined here.
// Any build containing these strings failed the no-inventing rule and must be flagged.
const placeholderMovePattern = /(?:\bBreaker\b|\bDrive\b|Generic Counter|Rose Flash|Time Stop Counter|Crimson Overdrive|Dragon Heel|Axe Kick Barrage|Bruce Combo|Ryuji Slam|Iron Counter|Dragon Pressure|Venom Counter|Tengoku Pull|Reactive Guard|Pika Flash|Light Kick|Photon Rush|Reflex Genjutsu|Eye Counter|Warrior Guard|Shadow Vanish|Shade Army|Doom Descent|Raion Burst|Black Lightning|Gaiden Spear|Staff Cyclone|Kaijin Impact|Tetsuo Shift)/i

export function validateOfficialMoveNames(abilities: string[]) {
  return abilities.filter((ability) => placeholderMovePattern.test(ability))
}
