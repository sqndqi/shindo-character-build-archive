import { z } from 'zod'

const bloodlineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string(),
  useMode: z.boolean(),
})

const hotbarSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  ability: z.string(),
  source: z.string(),
  purpose: z.string(),
  comboRole: z.string(),
  blockBreak: z.boolean(),
  usageNotes: z.string(),
})

export const buildSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  series: z.string().min(1),
  version: z.string().min(1),
  image: z.string(),
  bloodlines: z.array(bloodlineSchema).max(4),
  elements: z.array(z.string()).max(2),
  hotbar: z.array(hotbarSchema),
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
