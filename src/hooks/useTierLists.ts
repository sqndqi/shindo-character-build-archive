import { useEffect, useState } from 'react'
import { createPermanentId } from '../lib/identity'
import { readStorage, writeStorage } from '../services/storage'

export type TierRow = { id: string; label: string }
export type PersonalTierList = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  selectedRoster: string[]
  rows: TierRow[]
  assignments: Record<string, string>
  coverStyle: 'Crimson' | 'Charcoal'
  schemaVersion: 2
}

const KEY = 'shindo-build-archive:tier-lists:v2'
const PREFS = 'shindo-build-archive:prefs:v1'
const defaultRows = () => ['S+', 'S', 'A', 'B', 'C'].map((label) => ({ id: label.toLowerCase().replace('+', 'plus'), label }))
const createList = (title = 'My Tier List', assignments: Record<string, string> = {}): PersonalTierList => {
  const now = new Date().toISOString()
  return { id: createPermanentId('tier'), title, description: '', createdAt: now, updatedAt: now, selectedRoster: [], rows: defaultRows(), assignments, coverStyle: 'Crimson', schemaVersion: 2 }
}

export function useTierLists() {
  const [lists, setLists] = useState<PersonalTierList[]>(() => {
    const saved = readStorage<PersonalTierList[]>(KEY, [])
    if (saved.length) return saved
    const old = readStorage<{ tiers?: Record<string, string> }>(PREFS, {})
    return [createList('My First Tier List', old.tiers ?? {})]
  })
  useEffect(() => { writeStorage(KEY, lists) }, [lists])
  const update = (id: string, fn: (list: PersonalTierList) => PersonalTierList) => setLists((current) => current.map((list) => list.id === id ? { ...fn(list), updatedAt: new Date().toISOString() } : list))
  return {
    lists,
    create: () => setLists((current) => [...current, createList(`Tier List ${current.length + 1}`)]),
    addShared: (list: Omit<PersonalTierList, 'id' | 'createdAt' | 'updatedAt'>) => setLists((current) => [...current, { ...createList(list.title), ...list, id: createPermanentId('tier') }]),
    update,
    duplicate: (id: string) => setLists((current) => {
      const source = current.find((item) => item.id === id)
      return source ? [...current, { ...structuredClone(source), id: createPermanentId('tier'), title: `${source.title} Copy`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] : current
    }),
    remove: (id: string) => setLists((current) => current.filter((list) => list.id !== id)),
  }
}
