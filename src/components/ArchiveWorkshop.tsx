import { useMemo, useState } from 'react'
import { Heart, PackageCheck, ShieldCheck } from 'lucide-react'
import type { CharacterBuild } from '../types'
import type { OwnershipStatus } from '../hooks/useBloodlineCollection'

type Props = {
  builds: CharacterBuild[]
  statuses: Record<string, OwnershipStatus>
  elementStatuses: Record<string, OwnershipStatus>
  favorites: string[]
  onStatus: (name: string, status: OwnershipStatus) => void
  onElementStatus: (name: string, status: OwnershipStatus) => void
  onFavorite: (name: string) => void
}

export default function ArchiveWorkshop({ builds, statuses, elementStatuses, favorites, onStatus, onElementStatus, onFavorite }: Props) {
  const [search, setSearch] = useState('')
  const bloodlines = useMemo(() => [...new Set(builds.flatMap((build) => build.variants.flatMap((variant) => variant.bloodlines.map((slot) => slot.name))))].sort(), [builds])
  const elements = useMemo(() => [...new Set(builds.flatMap((build) => build.variants.flatMap((variant) => variant.elements.map((slot) => slot.name))))].sort(), [builds])
  const makeable = builds.filter((build) => build.variants.some((variant) => variant.bloodlines.every((slot) => statuses[slot.name] === 'Owned') && variant.elements.every((slot) => elementStatuses[slot.name] === 'Owned'))).length
  const missingOne = builds.filter((build) => build.variants.some((variant) => [...variant.bloodlines.map((slot) => statuses[slot.name]), ...variant.elements.map((slot) => elementStatuses[slot.name])].filter((status) => status !== 'Owned').length === 1)).length
  const statusSelect = (name: string, value: OwnershipStatus, onChange: (name: string, status: OwnershipStatus) => void) => (
    <select aria-label={`Ownership status for ${name}`} value={value} onChange={(event) => onChange(name, event.target.value as OwnershipStatus)}>
      <option>Owned</option><option>Not owned</option><option>Locked</option><option>Wanted</option>
    </select>
  )
  return (
    <main className="workshop-page">
      <header className="systems-hero"><span className="eyebrow"><PackageCheck size={15} /> MY INVENTORY</span><h1>Track what you own.</h1><p>Your collection and preferences stay in this browser. Official archive records cannot be changed here.</p></header>
      <section className="workshop-metrics">
        <article><span>OWNED BLOODLINES</span><strong>{bloodlines.filter((name) => statuses[name] === 'Owned').length}/{bloodlines.length}</strong></article>
        <article><span>BUILDS I CAN MAKE</span><strong>{makeable}</strong></article>
        <article><span>MISSING ONE ITEM</span><strong>{missingOne}</strong></article>
      </section>
      <section className="bloodline-vault">
        <header><div><ShieldCheck size={18} /><h2>Bloodlines</h2></div><input aria-label="Search inventory" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search items…" /></header>
        <div>{bloodlines.filter((name) => name.toLowerCase().includes(search.toLowerCase())).map((name) => <article key={name}>
          <button className={favorites.includes(name) ? 'is-favorite' : ''} onClick={() => onFavorite(name)} aria-label={`${favorites.includes(name) ? 'Unfavorite' : 'Favorite'} ${name}`}><Heart size={15} fill={favorites.includes(name) ? 'currentColor' : 'none'} /></button>
          <strong>{name}</strong>{statusSelect(name, statuses[name] ?? 'Not owned', onStatus)}
        </article>)}</div>
      </section>
      <section className="bloodline-vault">
        <header><div><ShieldCheck size={18} /><h2>Elements</h2></div></header>
        <div>{elements.map((name) => <article key={name}><span /><strong>{name}</strong>{statusSelect(name, elementStatuses[name] ?? 'Not owned', onElementStatus)}</article>)}</div>
      </section>
    </main>
  )
}
