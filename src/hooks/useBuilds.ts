import { useCallback, useEffect, useState } from 'react'
import { originalCharacters } from '../data/characters'
import { migrateStoredBuilds } from '../services/migration'
import { flushBuildSave, scheduleBuildSave } from '../services/storage'
import type { CharacterBuild } from '../types'

export function useBuilds() {
  const [builds, setBuilds] = useState<CharacterBuild[]>(migrateStoredBuilds)

  useEffect(() => {
    scheduleBuildSave(builds)
    return () => {
      flushBuildSave()
    }
  }, [builds])

  const save = useCallback((build: CharacterBuild) => {
    setBuilds((current) => current.map((item) => {
      if (item.id !== build.id) return item
      const changed = ['name', 'version', 'bloodlines', 'elements', 'cMode', 'zMode', 'combatArt', 'weapon', 'notes']
        .find((field) => JSON.stringify(item[field as keyof CharacterBuild]) !== JSON.stringify(build[field as keyof CharacterBuild]))
      return {
        ...structuredClone(build),
        updatedAt: new Date().toISOString(),
        changeHistory: changed ? [...item.changeHistory, {
          field: changed,
          previousValue: JSON.stringify(item[changed as keyof CharacterBuild]),
          newValue: JSON.stringify(build[changed as keyof CharacterBuild]),
          date: new Date().toISOString(),
        }] : item.changeHistory,
      }
    }))
  }, [])

  const add = useCallback((build: CharacterBuild) => setBuilds((current) => [...current, build]), [])
  const remove = useCallback((id: string) => setBuilds((current) => current.filter((item) => item.id !== id)), [])
  const reset = useCallback((id: string) => {
    const original = originalCharacters.find((item) => item.id === id)
    if (original) setBuilds((current) => current.map((item) => item.id === id ? structuredClone(original) : item))
  }, [])
  const resetAll = useCallback(() => setBuilds(structuredClone(originalCharacters)), [])
  const replaceAll = useCallback((next: CharacterBuild[]) => setBuilds(structuredClone(next)), [])

  return { builds, save, add, remove, reset, resetAll, replaceAll }
}
