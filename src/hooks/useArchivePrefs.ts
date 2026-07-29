import { useEffect, useState } from 'react'
import type { TierRank } from '../types'

const PREFS_KEY = 'shindo-build-archive:prefs:v1'

export type ArchivePrefs = {
  favorites: string[]
  tiers: Record<string, TierRank>
  pageSize: '12' | '24' | '48' | '96'
  metaBias: number
  theme: 'shindo-green' | 'chakra-blue' | 'ember-crimson'
}

export const defaultArchivePrefs: ArchivePrefs = {
  favorites: [],
  tiers: {},
  pageSize: '24',
  metaBias: 50,
  theme: 'shindo-green',
}

export function mergeArchivePrefs(saved: Partial<ArchivePrefs>): ArchivePrefs {
  return { ...defaultArchivePrefs, ...saved, pageSize: saved.pageSize === ('all' as ArchivePrefs['pageSize']) ? '96' : saved.pageSize ?? defaultArchivePrefs.pageSize }
}

export function useArchivePrefs() {
  const [prefs, setPrefs] = useState<ArchivePrefs>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
      return mergeArchivePrefs(saved)
    } catch {
      return defaultArchivePrefs
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
  const setTheme = (theme: ArchivePrefs['theme']) => setPrefs((current) => ({ ...current, theme }))

  return { prefs, toggleFavorite, setTier, setPageSize, setMetaBias, setTheme }
}
