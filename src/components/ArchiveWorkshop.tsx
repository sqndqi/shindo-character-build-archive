import { memo, useMemo, useRef, useState } from 'react'
import { Download, Heart, PackageCheck, ShieldCheck, Upload } from 'lucide-react'
import type { CharacterBuild } from '../types'
import type { CollectionCategory, CollectionState, OwnershipStatus } from '../hooks/useBloodlineCollection'
import { ShindoIcon } from './ShindoIcon'

type Tab = 'Bloodlines' | 'Elements' | 'Modes' | 'Equipment' | 'Builds I Can Make' | 'Missing One Item' | 'Wanted' | 'Locked'
type InventoryItem = { name: string; category: CollectionCategory; usedBy: number; reviewedUse: number }

type Props = {
  builds: CharacterBuild[]
  collection: CollectionState
  onStatus: (name: string, status: OwnershipStatus) => void
  onElementStatus: (name: string, status: OwnershipStatus) => void
  onModeStatus: (name: string, status: OwnershipStatus) => void
  onEquipmentStatus: (name: string, status: OwnershipStatus) => void
  onBulk: (category: CollectionCategory, names: string[], status: OwnershipStatus) => void
  onImport: (data: Partial<CollectionState>) => void
  onFavorite: (name: string) => void
}

const InventoryCard = memo(function InventoryCard({
  item,
  status,
  favorite,
  onChange,
  onFavorite,
}: {
  item: InventoryItem
  status: OwnershipStatus
  favorite: boolean
  onChange: (name: string, status: OwnershipStatus) => void
  onFavorite: (name: string) => void
}) {
  return <article className="inventory-card">
    <ShindoIcon name={item.name} type={item.category === 'Equipment' ? undefined : item.category} size="large" />
    <div><span>{item.category}</span><strong>{item.name}</strong><small>{item.usedBy} builds · {item.reviewedUse} reviewed</small></div>
    <button className={favorite ? 'is-favorite' : ''} onClick={() => onFavorite(item.name)} aria-label={`${favorite ? 'Unfavorite' : 'Favorite'} ${item.name}`}><Heart size={15} fill={favorite ? 'currentColor' : 'none'} /></button>
    <select aria-label={`Ownership status for ${item.name}`} value={status} onChange={(event) => onChange(item.name, event.target.value as OwnershipStatus)}>
      <option>Owned</option><option>Not owned</option><option>Wanted</option><option>Locked</option>
    </select>
  </article>
})

export default function ArchiveWorkshop({
  builds,
  collection,
  onStatus,
  onElementStatus,
  onModeStatus,
  onEquipmentStatus,
  onBulk,
  onImport,
  onFavorite,
}: Props) {
  const [tab, setTab] = useState<Tab>('Bloodlines')
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo(() => {
    const records = new Map<string, InventoryItem>()
    const add = (name: string, category: CollectionCategory, reviewed: boolean) => {
      if (!name || /^(none|no z-mode|unresolved)/i.test(name)) return
      const key = `${category}:${name}`
      const current = records.get(key) ?? { name, category, usedBy: 0, reviewedUse: 0 }
      current.usedBy += 1
      if (reviewed) current.reviewedUse += 1
      records.set(key, current)
    }
    for (const build of builds) {
      const primary = build.variants.find((variant) => variant.type === 'Primary') ?? build.variants[0]
      const reviewed = build.publicationStatus === 'Reviewed'
      primary.bloodlines.forEach((slot) => add(slot.name, 'Bloodline', reviewed))
      primary.elements.forEach((slot) => add(slot.name, 'Element', reviewed))
      add(primary.cMode, 'Mode', reviewed)
      add(primary.zMode, 'Mode', reviewed)
      ;[primary.combatArt, primary.kenjutsu ?? 'None', primary.weapon, primary.ninjaTool, primary.consumable, primary.mentor, primary.race].forEach((name) => add(name, 'Equipment', reviewed))
    }
    return [...records.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [builds])

  const statusFor = (item: InventoryItem) => item.category === 'Bloodline'
    ? collection.statuses[item.name] ?? 'Not owned'
    : item.category === 'Element'
      ? collection.elementStatuses[item.name] ?? 'Not owned'
      : item.category === 'Mode'
        ? collection.modeStatuses[item.name] ?? 'Not owned'
        : collection.equipmentStatuses[item.name] ?? 'Not owned'
  const changeFor = (category: CollectionCategory) => category === 'Bloodline'
    ? onStatus
    : category === 'Element'
      ? onElementStatus
      : category === 'Mode'
        ? onModeStatus
        : onEquipmentStatus

  const readiness = useMemo(() => builds.map((build) => {
    const variants = build.variants.map((variant) => {
      const missing = [
        ...variant.bloodlines.filter((slot) => collection.statuses[slot.name] !== 'Owned').map((slot) => slot.name),
        ...variant.elements.filter((slot) => collection.elementStatuses[slot.name] !== 'Owned').map((slot) => slot.name),
      ]
      return { variant, missing }
    })
    const best = variants.sort((a, b) => a.missing.length - b.missing.length)[0]
    return { build, ...best }
  }), [builds, collection.elementStatuses, collection.statuses])

  const makeable = readiness.filter((item) => item.missing.length === 0)
  const missingOne = readiness.filter((item) => item.missing.length === 1)
  const unlockValues = items
    .filter((item) => item.category === 'Bloodline' && statusFor(item) !== 'Owned')
    .map((item) => ({
      ...item,
      unlocks: missingOne.filter((entry) => entry.missing[0] === item.name).length,
      score: item.reviewedUse * 3 + item.usedBy + (collection.favorites.includes(item.name) ? 4 : 0),
    }))
    .sort((a, b) => b.unlocks - a.unlocks || b.score - a.score)
  const nextUnlock = unlockValues[0]

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (tab === 'Bloodlines') return item.category === 'Bloodline'
    if (tab === 'Elements') return item.category === 'Element'
    if (tab === 'Modes') return item.category === 'Mode'
    if (tab === 'Equipment') return item.category === 'Equipment'
    if (tab === 'Wanted') return statusFor(item) === 'Wanted'
    if (tab === 'Locked') return statusFor(item) === 'Locked'
    return false
  })
  const isItemTab = !['Builds I Can Make', 'Missing One Item'].includes(tab)

  const exportPreferences = () => {
    const payload = JSON.stringify({ schemaVersion: 1, type: 'shindo-personal-inventory', ...collection }, null, 2)
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'shindo-personal-inventory.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  const importPreferences = async (file?: File) => {
    if (!file) return
    try {
      const payload = JSON.parse(await file.text())
      if (payload?.type !== 'shindo-personal-inventory') throw new Error('Not an inventory preference file')
      onImport(payload)
    } catch {
      alert('This file is not a valid personal inventory preference backup.')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return <main className="workshop-page">
    <header className="systems-hero"><span className="eyebrow"><PackageCheck size={15} /> My Inventory</span><h1>Your Shindo collection.</h1><p>Track ownership and see which archive builds your items unlock. This never changes official builds.</p></header>
    <section className="workshop-metrics">
      <article><span>Owned Bloodlines</span><strong>{items.filter((item) => item.category === 'Bloodline' && statusFor(item) === 'Owned').length}/{items.filter((item) => item.category === 'Bloodline').length}</strong></article>
      <article><span>Owned elements</span><strong>{items.filter((item) => item.category === 'Element' && statusFor(item) === 'Owned').length}/{items.filter((item) => item.category === 'Element').length}</strong></article>
      <article><span>Builds I can make</span><strong>{makeable.length}</strong></article>
      <article><span>Missing one item</span><strong>{missingOne.length}</strong></article>
      <article className="unlock-value"><span>Best archive unlock value</span><strong>{nextUnlock?.name ?? 'Own more items to calculate'}</strong><small>{nextUnlock ? nextUnlock.unlocks > 0 ? `Could complete ${nextUnlock.unlocks} near-ready build${nextUnlock.unlocks === 1 ? '' : 's'}. This is archive coverage, not meta advice.` : `Used by ${nextUnlock.usedBy} archive builds, including ${nextUnlock.reviewedUse} reviewed builds. This is archive coverage, not meta advice.` : 'No unowned Bloodline recommendation available.'}</small></article>
    </section>
    <section className="inventory-shell">
      <div className="inventory-tabs" role="tablist">{(['Bloodlines', 'Elements', 'Modes', 'Equipment', 'Builds I Can Make', 'Missing One Item', 'Wanted', 'Locked'] as Tab[]).map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
      <div className="inventory-toolbar"><div><ShieldCheck size={18} /><input aria-label="Search inventory" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inventory…" /></div><div>{isItemTab && <><button className="button button--outline" onClick={() => {
        const groups = new Map<CollectionCategory, string[]>()
        filteredItems.forEach((item) => groups.set(item.category, [...(groups.get(item.category) ?? []), item.name]))
        groups.forEach((names, category) => onBulk(category, names, 'Owned'))
      }}>Mark filtered owned</button><button className="button button--text" onClick={() => {
        const groups = new Map<CollectionCategory, string[]>()
        filteredItems.forEach((item) => groups.set(item.category, [...(groups.get(item.category) ?? []), item.name]))
        groups.forEach((names, category) => onBulk(category, names, 'Not owned'))
      }}>Clear filtered ownership</button></>}<button className="button button--outline" onClick={exportPreferences}><Download size={14} /> Export preferences</button><button className="button button--outline" onClick={() => inputRef.current?.click()}><Upload size={14} /> Import preferences</button><input ref={inputRef} hidden type="file" accept="application/json" onChange={(event) => importPreferences(event.target.files?.[0])} /></div></div>
      {tab === 'Builds I Can Make' || tab === 'Missing One Item'
        ? <div className="inventory-build-list">{(tab === 'Builds I Can Make' ? makeable : missingOne).filter((entry) => entry.build.name.toLowerCase().includes(search.toLowerCase())).map((entry) => <article key={entry.build.id}><strong>{entry.build.name}</strong><span>{entry.variant.name}</span><small>{entry.missing.length ? `Missing ${entry.missing.join(', ')}` : 'Ready from owned Bloodlines and elements'}</small></article>)}</div>
        : <div className="inventory-grid">{filteredItems.map((item) => <InventoryCard key={`${item.category}-${item.name}`} item={item} status={statusFor(item)} favorite={collection.favorites.includes(item.name)} onChange={changeFor(item.category)} onFavorite={onFavorite} />)}</div>}
      {!filteredItems.length && isItemTab && <div className="empty-state"><h3>No inventory items match</h3><p>Try another tab or clear the search.</p></div>}
    </section>
  </main>
}
