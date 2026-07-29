import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../services/storage'

export type OwnershipStatus = 'Owned' | 'Not owned' | 'Locked' | 'Wanted'
const KEY = 'shindo-build-archive:bloodlines:v1'

type CollectionState = { statuses: Record<string, OwnershipStatus>; elementStatuses: Record<string, OwnershipStatus>; favorites: string[] }
const defaults: CollectionState = { statuses: {}, elementStatuses: {}, favorites: [] }

export function useBloodlineCollection() {
  const [collection, setCollection] = useState<CollectionState>(() => ({ ...defaults, ...readStorage(KEY, defaults) }))
  useEffect(() => { writeStorage(KEY, collection) }, [collection])
  const setStatus = useCallback((name: string, status: OwnershipStatus) => setCollection((current) => ({
    ...current,
    statuses: { ...current.statuses, [name]: status },
  })), [])
  const toggleFavorite = useCallback((name: string) => setCollection((current) => ({
    ...current,
    favorites: current.favorites.includes(name) ? current.favorites.filter((item) => item !== name) : [...current.favorites, name],
  })), [])
  const setElementStatus = useCallback((name: string, status: OwnershipStatus) => setCollection((current) => ({
    ...current,
    elementStatuses: { ...current.elementStatuses, [name]: status },
  })), [])
  return { collection, setStatus, setElementStatus, toggleFavorite }
}
