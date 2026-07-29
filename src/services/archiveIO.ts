import type { CharacterBuild } from '../types'
import { buildSchema } from '../lib/validation'
import { repairBuildDatabase } from './migration'

export function exportArchive(builds: CharacterBuild[]): string {
  return JSON.stringify({ schemaVersion: 2, exportedAt: new Date().toISOString(), builds }, null, 2)
}

export function importArchive(raw: string): { builds: CharacterBuild[]; errors: string[] } {
  try {
    const parsed = JSON.parse(raw)
    const records = Array.isArray(parsed) ? parsed : parsed?.builds
    if (!Array.isArray(records)) return { builds: [], errors: ['Import must contain a builds array.'] }
    const errors: string[] = []
    const valid = records.filter((record, index) => {
      const result = buildSchema.safeParse(record)
      if (!result.success) errors.push(`Record ${index + 1}: ${result.error.issues[0]?.message ?? 'Invalid build'}`)
      return result.success
    }) as CharacterBuild[]
    return { builds: repairBuildDatabase(valid), errors }
  } catch {
    return { builds: [], errors: ['The selected file is not valid JSON.'] }
  }
}
