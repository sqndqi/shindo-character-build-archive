import { useEffect, useMemo, useState } from 'react'
import { Check, LockKeyhole, Pin, Search, Shuffle, Sparkles } from 'lucide-react'
import type { ArchiveBuildRecord } from '../types/archiveAccess'
import { Portrait } from './Portrait'
import { useCharacterPackDraft, type PackType } from '../hooks/useCharacterPackDraft'
import { archiveAccountApiConfigured } from '../repositories/ArchiveAccessRepository'
import { characterPackProducts, formatPrice, freeCharacterIds } from '../lib/characterPacks'
import { characterPackRepository } from '../repositories/CharacterPackRepository'

const products: { type: PackType; name: string; price: string; limit: number; total: number }[] = [
  { type: 'starter', name: characterPackProducts.starter.name, price: formatPrice(characterPackProducts.starter.priceCents), limit: 30, total: 35 },
  { type: 'plus', name: characterPackProducts.plus.name, price: formatPrice(characterPackProducts.plus.priceCents), limit: 50, total: 55 },
  { type: 'full', name: characterPackProducts.full.name, price: formatPrice(characterPackProducts.full.priceCents), limit: 95, total: 100 },
]
const freeIds = new Set<string>(freeCharacterIds)

export default function CharacterPackPicker({ builds, ownedIds, onDraftChange }: { builds: ArchiveBuildRecord[]; ownedIds: string[]; onDraftChange?: (selectedIds: string[]) => void }) {
  const pack = useCharacterPackDraft()
  const [search, setSearch] = useState('')
  const [series, setSeries] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const owned = useMemo(() => new Set(ownedIds), [ownedIds])
  const ownedPremiumCount = ownedIds.filter((id) => !freeIds.has(id)).length
  const premium = useMemo(() => builds.filter((build) => !freeIds.has(build.id) && !owned.has(build.id)), [builds, owned])
  const premiumIds = useMemo(() => new Set(premium.map((build) => build.id)), [premium])
  const visible = premium.filter((build) => `${build.name} ${build.series} ${build.version} ${build.archetype.join(' ')}`.toLowerCase().includes(search.toLowerCase()) && (!series || build.series === series))
  const targetTotal = characterPackProducts[pack.draft.packageType].selectionLimit
  const requiredSelections = Math.max(0, targetTotal - ownedPremiumCount)
  const effectiveSelectedIds = useMemo(() => pack.draft.packageType === 'full' ? premium.map((build) => build.id) : pack.selectedIds.filter((id) => premiumIds.has(id)).slice(0, requiredSelections), [pack.draft.packageType, pack.selectedIds, premium, premiumIds, requiredSelections])
  const manual = effectiveSelectedIds.filter((id) => pack.draft.selections[id] === 'manual').length
  const randomized = effectiveSelectedIds.length - manual
  const ready = effectiveSelectedIds.length === Math.min(requiredSelections, premium.length)

  useEffect(() => onDraftChange?.(effectiveSelectedIds), [effectiveSelectedIds, onDraftChange])

  const checkout = async (provider: 'stripe' | 'manual_crypto') => {
    setCheckoutBusy(true)
    setCheckoutMessage('')
    try {
      const confirmed = await characterPackRepository.confirmSelection(pack.draft.packageType, pack.draft, effectiveSelectedIds)
      const result = await characterPackRepository.createCheckout(confirmed.order.id, provider)
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl)
      else setCheckoutMessage('Selection saved. Payment instructions are pending.')
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : 'Checkout could not be started.')
    } finally {
      setCheckoutBusy(false)
    }
  }

  if (pack.draft.stage === 'confirm') return <main className="pack-page"><section className="pack-confirmation">
    <header><span>Selection confirmation</span><h1>{effectiveSelectedIds.length}/{requiredSelections} ready</h1><p>{pack.draft.packageType === 'full' ? 'All remaining premium characters selected' : `${manual} manually selected · ${randomized} randomized`} · five free builds included separately</p></header>
    <div className="pack-confirmation__summary"><strong>{products.find((item) => item.type === pack.draft.packageType)?.name}</strong><span>{products.find((item) => item.type === pack.draft.packageType)?.price}</span><small>Permanent access to these exact character IDs. Selections cannot be self-swapped after payment.</small></div>
    <div className="pack-confirmation__list">{effectiveSelectedIds.map((id) => {
      const build = builds.find((item) => item.id === id)
      return build && <article key={id}><Portrait src={build.thumbnail ?? build.image} alt="" thumbnail /><div><strong>{build.name}</strong><span>{build.series} · {build.version}</span></div><small>{pack.draft.packageType === 'full' ? 'full archive' : pack.draft.selections[id]}</small></article>
    })}</div>
    {checkoutMessage && <p className="pack-checkout-message" role="status">{checkoutMessage}</p>}
    <div className="pack-confirmation__actions"><button className="button button--outline" onClick={() => pack.setStage('pick')}>Back to selection</button><button className="button button--outline" disabled={!archiveAccountApiConfigured || checkoutBusy} onClick={() => checkout('manual_crypto')}>Manual crypto</button><button className="button button--primary" disabled={!archiveAccountApiConfigured || checkoutBusy} onClick={() => checkout('stripe')}>{archiveAccountApiConfigured ? 'Pay securely by card' : 'Checkout disabled in local staging'}</button></div>
  </section></main>

  return <main className="pack-page">
    <header className="pack-hero"><span><Sparkles /> Permanent character access</span><h1>Build your character pack.</h1><p>Select the exact archive characters you want. The five free builds never consume a paid slot.</p></header>
    <section className="pack-products">{products.map((product) => <button className={pack.draft.packageType === product.type ? 'active' : ''} key={product.type} onClick={() => pack.setPackage(product.type, Math.max(0, product.limit - ownedPremiumCount))}><span>{product.name}</span><strong>{product.price}</strong><small>{product.type === 'full' ? 'All 95 premium characters' : `Pick ${product.limit} premium builds`} · {product.total} total with free builds</small></button>)}</section>
    <p className="pack-upgrade-note">Permanent access. Upgrades charge only the difference: Starter → Plus $2 · Plus → Full $4 · Starter → Full $6.</p>
    <section className="pack-counter"><div><strong>{effectiveSelectedIds.length}/{requiredSelections}</strong><span>new selections</span></div><div><strong>{manual}</strong><span>manual</span></div><div><strong>{randomized}</strong><span>randomized</span></div><button className="button button--outline" disabled={pack.draft.packageType === 'full'} onClick={() => pack.randomizeRemaining(premium.map((build) => build.id), requiredSelections)}><Shuffle /> Randomize remaining</button><button className="button button--primary" disabled={!ready} onClick={() => pack.setStage('confirm')}>Review selection</button></section>
    {pack.draft.packageType !== 'full' && <><section className="pack-filters"><label><Search /><input aria-label="Search pack characters" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search characters, series, or archetypes…" /></label><select aria-label="Filter pack characters by series" value={series} onChange={(event) => setSeries(event.target.value)}><option value="">All series</option>{[...new Set(premium.map((build) => build.series))].map((value) => <option key={value}>{value}</option>)}</select></section>
    <section className="pack-picker-grid">{visible.map((build) => {
      const selected = Boolean(pack.draft.selections[build.id])
      const pinned = pack.draft.pinned.includes(build.id)
      return <article className={selected ? 'is-selected' : ''} key={build.id}><div className="pack-picker-card__portrait"><Portrait src={build.thumbnail ?? build.image} alt={build.name} thumbnail /><span className={selected ? 'access-seal access-seal--selected' : 'access-seal access-seal--locked'}>{selected ? 'Selected' : 'Locked'}</span></div><div><strong>{build.name}</strong><span>{build.series} · {build.version}</span><small>{build.archetype.slice(0, 3).join(' · ')}</small></div><button className="pack-select-button" onClick={() => pack.toggle(build.id, requiredSelections)}>{selected ? <><Check /> Remove</> : <><LockKeyhole /> Select</>}</button><button className={`pack-pin-button ${pinned ? 'active' : ''}`} disabled={!selected} onClick={() => pack.togglePin(build.id)} aria-label={`${pinned ? 'Unpin' : 'Pin'} ${build.name}`}><Pin /></button></article>
    })}</section></>}
    <button className="button button--text pack-cancel" onClick={() => history.back()}>Cancel — keep unfinished draft</button>
  </main>
}
