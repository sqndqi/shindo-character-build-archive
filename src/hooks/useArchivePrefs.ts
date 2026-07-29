import { useEffect, useState } from 'react'
import type { TierRank } from '../types'

const PREFS_KEY = 'shindo-build-archive:prefs:v1'

type ArchivePrefs = {
  favorites: string[]
  tiers: Record<string, TierRank>
  pageSize: '12' | '24' | '48' | '96'
  metaBias: number
}

const defaults: ArchivePrefs = {
  favorites: [],
  tiers: {},
  pageSize: '24',
  metaBias: 50,
}

export function useArchivePrefs() {
  const [prefs, setPrefs] = useState<ArchivePrefs>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
      return { ...defaults, ...saved, pageSize: saved.pageSize === 'all' ? '96' : saved.pageSize ?? defaults.pageSize }
    } catch {
      return defaults
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      // Preference persistence is optional.
    }
  }, [prefs])

  const toggleFavorite = (id: string) => setPrefs((current) => ({
    ...current,
    favorites: current.favorites.includes(id)
      ? current.favorites.filter((item) => item !== id)
      : [...current.favorites, id],
  }))

  const setTier = (id: string, tier: TierRank) => setPrefs((current) => ({
    ...current,
    tiers: { ...current.tiers, [id]: tier },
  }))

  const setPageSize = (pageSize: ArchivePrefs['pageSize']) => setPrefs((current) => ({ ...current, pageSize }))
  const setMetaBias = (metaBias: number) => setPrefs((current) => ({ ...current, metaBias }))

  return { prefs, toggleFavorite, setTier, setPageSize, setMetaBias }
}
