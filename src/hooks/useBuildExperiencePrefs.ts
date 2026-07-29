import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../services/storage'

const KEY = 'shindo-build-archive:build-experience:v1'

type BuildExperiencePrefs = {
  variantFavorites: string[]
  recentlyViewed: string[]
  updateWatchlist: string[]
}

const defaults: BuildExperiencePrefs = {
  variantFavorites: [],
  recentlyViewed: [],
  updateWatchlist: [],
}

export function useBuildExperiencePrefs() {
  const [state, setState] = useState<BuildExperiencePrefs>(() => ({ ...defaults, ...readStorage(KEY, defaults) }))
  useEffect(() => { writeStorage(KEY, state) }, [state])

  const toggleVariantFavorite = useCallback((id: string) => setState((current) => ({
    ...current,
    variantFavorites: current.variantFavorites.includes(id)
      ? current.variantFavorites.filter((item) => item !== id)
      : [...current.variantFavorites, id],
  })), [])
  const markViewed = useCallback((id: string) => setState((current) => ({
    ...current,
    recentlyViewed: [id, ...current.recentlyViewed.filter((item) => item !== id)].slice(0, 10),
  })), [])
  const toggleWatch = useCallback((id: string) => setState((current) => ({
    ...current,
    updateWatchlist: current.updateWatchlist.includes(id)
      ? current.updateWatchlist.filter((item) => item !== id)
      : [...current.updateWatchlist, id],
  })), [])

  return { state, toggleVariantFavorite, markViewed, toggleWatch }
}
