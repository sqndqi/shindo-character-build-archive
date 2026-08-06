export type CharacterPackType = 'starter' | 'plus' | 'full'

export const freeCharacterIds = ['zack-lee', 'vasco', 'gray-yeon', 'yu', 'jin-mori'] as const

export const characterPackProducts = {
  starter: { name: 'Starter', selectionLimit: 30, priceCents: 399 },
  plus: { name: 'Plus', selectionLimit: 50, priceCents: 599 },
  full: { name: 'Full Archive', selectionLimit: 95, priceCents: 999 },
} as const

export const characterPackUpgradePrices: Record<string, number> = {
  'starter:plus': 200,
  'plus:full': 400,
  'starter:full': 600,
}

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export function eligibleCharacterIds(allIds: string[], ownedIds: string[]) {
  const free = new Set<string>(freeCharacterIds)
  const owned = new Set(ownedIds)
  return [...new Set(allIds)].filter((id) => !free.has(id) && !owned.has(id))
}

export function validatePackSelection(type: CharacterPackType, ids: string[], ownedIds: string[]) {
  const unique = new Set(ids)
  const allowed = new Set(eligibleCharacterIds(ids, ownedIds))
  return unique.size === ids.length
    && ids.every((id) => allowed.has(id))
    && ids.length === characterPackProducts[type].selectionLimit
}

export function fillRandomSelection(
  selections: Record<string, 'manual' | 'randomized'>,
  pinned: string[],
  eligibleIds: string[],
  limit: number,
  randomizedOrder: string[],
) {
  const eligible = new Set(eligibleIds)
  const retained = Object.fromEntries(Object.entries(selections).filter(([id, kind]) =>
    eligible.has(id) && (kind === 'manual' || pinned.includes(id)),
  ))
  const needed = Math.max(0, limit - Object.keys(retained).length)
  const candidates = [...new Set(randomizedOrder)].filter((id) => eligible.has(id) && !retained[id])
  return {
    ...retained,
    ...Object.fromEntries(candidates.slice(0, needed).map((id) => [id, 'randomized' as const])),
  }
}
