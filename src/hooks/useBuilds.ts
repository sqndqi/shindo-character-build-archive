import { useCallback, useEffect, useState } from 'react'
import { originalCharacters } from '../data/characters'
import type { CharacterBuild } from '../types'

const STORAGE_KEY = 'shindo-build-archive:v1'

function normalizeBuild(build: CharacterBuild): CharacterBuild {
  const original = originalCharacters.find((item) => item.id === build.id)
  return {
    ...original,
    ...build,
    franchise: build.franchise ?? original?.franchise ?? build.series,
    combatTags: build.combatTags ?? original?.combatTags ?? ['Martial arts'],
    customTags: build.customTags ?? [],
    effectsIntensity: build.effectsIntensity ?? original?.effectsIntensity ?? 'Medium',
    ratings: {
      ...(original?.ratings ?? {}),
      ...build.ratings,
      aura: build.ratings?.aura ?? original?.ratings.aura ?? 8,
    },
  } as CharacterBuild
}

function loadBuilds(): CharacterBuild[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return structuredClone(originalCharacters)
    const local = (JSON.parse(saved) as CharacterBuild[]).map(normalizeBuild)
    const localIds = new Set(local.map((build) => build.id))
    const additions = originalCharacters.filter((build) => !localIds.has(build.id))
    return [...local, ...structuredClone(additions)]
  } catch {
    return structuredClone(originalCharacters)
  }
}

export function useBuilds() {
  const [builds, setBuilds] = useState<CharacterBuild[]>(loadBuilds)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(builds))
    } catch {
      // The app remains usable if storage is full or unavailable.
    }
  }, [builds])

  const save = useCallback((build: CharacterBuild) => {
    setBuilds((current) => current.map((item) => item.id === build.id ? build : item))
  }, [])

  const add = useCallback((build: CharacterBuild) => setBuilds((current) => [...current, build]), [])
  const remove = useCallback((id: string) => setBuilds((current) => current.filter((item) => item.id !== id)), [])
  const reset = useCallback((id: string) => {
    const original = originalCharacters.find((item) => item.id === id)
    if (original) setBuilds((current) => current.map((item) => item.id === id ? structuredClone(original) : item))
  }, [])
  const resetAll = useCallback(() => setBuilds(structuredClone(originalCharacters)), [])

  return { builds, save, add, remove, reset, resetAll }
}
