export const TIER_SHARE_VERSION = 1

export type SharedTierList = {
  v: 1
  title: string
  description: string
  rows: { id: string; label: string }[]
  assignments: Record<string, string>
}

export function encodeTierShare(payload: Omit<SharedTierList, 'v'>) {
  const json = JSON.stringify({ v: TIER_SHARE_VERSION, ...payload })
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeTierShare(value: string): SharedTierList {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SharedTierList
  if (parsed.v !== TIER_SHARE_VERSION || !Array.isArray(parsed.rows) || typeof parsed.assignments !== 'object') throw new Error('Unsupported tier-list link.')
  return parsed
}
