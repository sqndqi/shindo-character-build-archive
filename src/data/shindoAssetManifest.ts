import manifestData from './shindoAssetManifest.generated.json'

export type ShindoAssetType =
  | 'Bloodline'
  | 'Element'
  | 'Mode'
  | 'Combat Art'
  | 'Weapon'
  | 'Ninja Tool'
  | 'Consumable'
  | 'Mentor'
  | 'Race'
  | 'Move'

export interface ShindoAssetEntry {
  id: string
  type: ShindoAssetType
  name: string
  aliases: string[]
  sourceUrl: string
  originalFileUrl?: string
  localPath: string
  thumbnailPath?: string
  width: number
  height: number
  transparent: boolean
  checkedAt: string
  status: 'Available' | 'Missing' | 'Needs Review'
  notes?: string
}

export const shindoAssetManifest = manifestData as ShindoAssetEntry[]

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/\s+—\s+stage\s+\d+$/i, '')
  .replace(/[^a-z0-9]+/g, '')

const assetIndex = new Map<string, ShindoAssetEntry>()
for (const entry of shindoAssetManifest) {
  for (const label of [entry.name, ...entry.aliases]) {
    const key = `${entry.type}:${normalize(label)}`
    const existing = assetIndex.get(key)
    if (!existing || existing.status === 'Missing') assetIndex.set(key, entry)
  }
}

export function resolveShindoAsset(name: string, preferredType?: ShindoAssetType) {
  const normalized = normalize(name)
  if (preferredType) {
    const direct = assetIndex.get(`${preferredType}:${normalized}`)
    if (direct) return direct
  }
  return shindoAssetManifest.find((entry) =>
    normalize(entry.name) === normalized || entry.aliases.some((alias) => normalize(alias) === normalized))
}

