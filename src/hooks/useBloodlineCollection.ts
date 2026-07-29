import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../services/storage'

export type OwnershipStatus = 'Owned' | 'Not owned' | 'Locked' | 'Wanted'
const KEY = 'shindo-build-archive:bloodlines:v1'

export type CollectionCategory = 'Bloodline' | 'Element' | 'Mode' | 'Equipment'
export type CollectionState = {
  statuses: Record<string, OwnershipStatus>
  elementStatuses: Record<string, OwnershipStatus>
  modeStatuses: Record<string, OwnershipStatus>
  equipmentStatuses: Record<string, OwnershipStatus>
  favorites: string[]
}
const defaults: CollectionState = { statuses: {}, elementStatuses: {}, modeStatuses: {}, equipmentStatuses: {}, favorites: [] }

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
  const setModeStatus = useCallback((name: string, status: OwnershipStatus) => setCollection((current) => ({
    ...current,
    modeStatuses: { ...current.modeStatuses, [name]: status },
  })), [])
  const setEquipmentStatus = useCallback((name: string, status: OwnershipStatus) => setCollection((current) => ({
    ...current,
    equipmentStatuses: { ...current.equipmentStatuses, [name]: status },
  })), [])
  const setMany = useCallback((category: CollectionCategory, names: string[], status: OwnershipStatus) => setCollection((current) => {
    const field = category === 'Bloodline' ? 'statuses' : category === 'Element' ? 'elementStatuses' : category === 'Mode' ? 'modeStatuses' : 'equipmentStatuses'
    return { ...current, [field]: { ...current[field], ...Object.fromEntries(names.map((name) => [name, status])) } }
  }), [])
  const importPreferences = useCallback((next: Partial<CollectionState>) => setCollection((current) => ({
    statuses: { ...current.statuses, ...(next.statuses ?? {}) },
    elementStatuses: { ...current.elementStatuses, ...(next.elementStatuses ?? {}) },
    modeStatuses: { ...current.modeStatuses, ...(next.modeStatuses ?? {}) },
    equipmentStatuses: { ...current.equipmentStatuses, ...(next.equipmentStatuses ?? {}) },
    favorites: Array.isArray(next.favorites) ? [...new Set(next.favorites.filter((item): item is string => typeof item === 'string'))] : current.favorites,
  })), [])
  return { collection, setStatus, setElementStatus, setModeStatus, setEquipmentStatus, setMany, importPreferences, toggleFavorite }
}
