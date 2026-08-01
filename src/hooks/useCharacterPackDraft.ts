import { useCallback, useMemo, useState } from 'react'
import { readStorage, writeStorage } from '../services/storage'
import { characterPackProducts, fillRandomSelection, type CharacterPackType } from '../lib/characterPacks'

export type PackType = CharacterPackType
export type PackSelectionKind = 'manual' | 'randomized'
export type PackDraft = {
  packageType: PackType
  selections: Record<string, PackSelectionKind>
  pinned: string[]
  stage: 'pick' | 'confirm'
}

const key = 'shindo-build-archive:character-pack-draft:v1'
const limits: Record<PackType, number> = {
  starter: characterPackProducts.starter.selectionLimit,
  plus: characterPackProducts.plus.selectionLimit,
  full: characterPackProducts.full.selectionLimit,
}
const initial: PackDraft = { packageType: 'starter', selections: {}, pinned: [], stage: 'pick' }

function shuffle(values: string[]) {
  const next = [...values]
  const random = new Uint32Array(next.length)
  crypto.getRandomValues(random)
  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = random[index] % (index + 1)
    ;[next[index], next[target]] = [next[target], next[index]]
  }
  return next
}

export function useCharacterPackDraft() {
  const [draft, setDraftState] = useState<PackDraft>(() => readStorage(key, initial))
  const setDraft = useCallback((update: (current: PackDraft) => PackDraft) => setDraftState((current) => {
    const next = update(current)
    writeStorage(key, next)
    return next
  }), [])
  const limit = limits[draft.packageType]
  const selectedIds = useMemo(() => Object.keys(draft.selections), [draft.selections])

  const setPackage = (packageType: PackType, selectionLimit = limits[packageType]) => setDraft((current) => {
    const allowed = Math.min(limits[packageType], selectionLimit)
    const kept = Object.fromEntries(Object.entries(current.selections).slice(0, allowed))
    return { ...current, packageType, selections: kept, pinned: current.pinned.filter((id) => id in kept), stage: 'pick' }
  })
  const toggle = (id: string, selectionLimit = limits[draft.packageType]) => setDraft((current) => {
    const selections = { ...current.selections }
    if (selections[id]) delete selections[id]
    else if (Object.keys(selections).length < Math.min(limits[current.packageType], selectionLimit)) selections[id] = 'manual'
    return { ...current, selections, pinned: current.pinned.filter((item) => item !== id) }
  })
  const togglePin = (id: string) => setDraft((current) => current.selections[id]
    ? { ...current, pinned: current.pinned.includes(id) ? current.pinned.filter((item) => item !== id) : [...current.pinned, id] }
    : current)
  const randomizeRemaining = (eligibleIds: string[], selectionLimit = limits[draft.packageType]) => setDraft((current) => {
    const randomized = shuffle(eligibleIds)
    return { ...current, selections: fillRandomSelection(current.selections, current.pinned, eligibleIds, Math.min(limits[current.packageType], selectionLimit), randomized) }
  })
  const setStage = (stage: PackDraft['stage']) => setDraft((current) => ({ ...current, stage }))
  const clear = () => setDraft(() => initial)

  return { draft, limit, selectedIds, setPackage, toggle, togglePin, randomizeRemaining, setStage, clear }
}
