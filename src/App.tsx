import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, ChevronLeft, ChevronRight, Dice5, Grid2X2, Heart, Menu, Rows3, Search, SlidersHorizontal, Swords, Table2, X } from 'lucide-react'
import type { CharacterBuild } from './types'
import { buildRepository } from './repositories/BuildRepository'
import { useArchivePrefs } from './hooks/useArchivePrefs'
import { useBloodlineCollection } from './hooks/useBloodlineCollection'
import { useTierLists } from './hooks/useTierLists'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { migratePublicData } from './services/publicMigration'
import { readStorage, writeStorage } from './services/storage'
import { comparePublicationStatus } from './lib/publication'
import { Gallery } from './components/Gallery'
import { BuildTable } from './components/BuildTable'
import { BuildDetail } from './components/BuildDetail'
import { ErrorBoundary } from './components/ErrorBoundary'

const ComparePanel = lazy(() => import('./components/ComparePanel').then((module) => ({ default: module.ComparePanel })))
const TierListBoard = lazy(() => import('./components/TierListBoard').then((module) => ({ default: module.TierListBoard })))
const ArchiveWorkshop = lazy(() => import('./components/ArchiveWorkshop'))
const SuggestionsPage = lazy(() => import('./components/SuggestionsPage'))
const DiagnosticsPage = import.meta.env.DEV ? lazy(() => import('./components/DiagnosticsPage')) : null

type View = 'builds' | 'database' | 'tiers' | 'inventory' | 'compare' | 'suggestions' | 'diagnostics'
const emptyFilters = { franchise: '', series: '', status: '', bloodline: '', favorites: '', owned: '' }
const compareKey = 'shindo-build-archive:compare:v1'

export default function App() {
  const [builds, setBuilds] = useState<CharacterBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { prefs, toggleFavorite, setPageSize, setMetaBias } = useArchivePrefs()
  const { collection, setStatus, setElementStatus, toggleFavorite: toggleBloodlineFavorite } = useBloodlineCollection()
  const tiers = useTierLists()
  const [view, setView] = useState<View>('builds')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cardMode, setCardMode] = useState<'compact' | 'visual'>('compact')
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput)
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<CharacterBuild | null>(null)
  const [compareIds, setCompareIds] = useState<string[]>(() => readStorage(compareKey, []))

  useEffect(() => {
    migratePublicData()
    buildRepository.listBuildPreviews()
      .then((previews) => Promise.all(previews.map((preview) => buildRepository.getBuild(preview.id))))
      .then(setBuilds).catch(() => setLoadError('The archive could not be loaded. Your personal preferences were not changed.')).finally(() => setLoading(false))
  }, [])
  useEffect(() => { writeStorage(compareKey, compareIds.filter((id) => builds.some((build) => build.id === id))) }, [builds, compareIds])

  const values = useMemo(() => ({
    franchises: [...new Set(builds.map((build) => build.franchise))].sort(),
    series: [...new Set(builds.map((build) => build.series))].sort(),
    bloodlines: [...new Set(builds.flatMap((build) => build.variants.flatMap((variant) => variant.bloodlines.map((slot) => slot.name))))].sort(),
  }), [builds])
  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    const meta = prefs.metaBias / 100
    return builds.filter((build) => {
      const primary = build.variants[0]
      const missing = [...primary.bloodlines.map((slot) => collection.statuses[slot.name]), ...primary.elements.map((slot) => collection.elementStatuses[slot.name])].filter((status) => status !== 'Owned').length
      return (!query || `${build.name} ${build.series} ${build.version} ${primary.bloodlines.map((slot) => slot.name).join(' ')}`.toLowerCase().includes(query))
        && (!filters.franchise || build.franchise === filters.franchise)
        && (!filters.series || build.series === filters.series)
        && (!filters.status || build.publicationStatus === filters.status)
        && (!filters.bloodline || primary.bloodlines.some((slot) => slot.name === filters.bloodline))
        && (!filters.favorites || prefs.favorites.includes(build.id))
        && (!filters.owned || (filters.owned === 'makeable' ? missing === 0 : missing <= 1))
    }).sort((a, b) => comparePublicationStatus(a, b) || (b.ratings.accuracy * (1 - meta) + b.ratings.pvp * meta) - (a.ratings.accuracy * (1 - meta) + a.ratings.pvp * meta))
  }, [builds, collection.elementStatuses, collection.statuses, filters, prefs.favorites, prefs.metaBias, search])
  const pageSize = Number(prefs.pageSize)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageBuilds = filtered.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => setPage((current) => Math.min(current, pageCount)), [pageCount])
  const compared = compareIds.map((id) => builds.find((build) => build.id === id)).filter(Boolean) as CharacterBuild[]
  const toggleCompare = useCallback((id: string) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current), [])
  const navigate = (next: View) => { setView(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }) }
  const nav: [View, string][] = [['builds', 'Builds'], ['database', 'Database'], ['tiers', 'Tier Lists'], ['inventory', 'My Inventory'], ['compare', 'Compare'], ['suggestions', 'Suggestions']]
  if (import.meta.env.DEV) nav.push(['diagnostics', 'Diagnostics'])

  return <div className="app-shell">
    <header className="site-header">
      <button className="brand" onClick={() => navigate('builds')}><span className="brand-mark"><Archive size={22} /></span><span><b>SHINDO</b><strong>CHARACTER BUILD ARCHIVE</strong></span></button>
      <button className="mobile-menu-button" aria-expanded={mobileOpen} aria-label="Toggle navigation" onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X /> : <Menu />}</button>
      <nav className={mobileOpen ? 'is-open' : ''} aria-label="Primary navigation">{nav.map(([key, label]) => <button key={key} className={view === key ? 'active' : ''} onClick={() => navigate(key)}>{label}</button>)}</nav>
    </header>

    {loading ? <main className="loading-page">Loading archive…</main>
      : loadError ? <main className="empty-state"><h2>Archive unavailable</h2><p>{loadError}</p></main>
      : view === 'tiers' ? <Suspense fallback={<main className="loading-page">Loading your tier lists…</main>}><main><TierListBoard builds={builds} lists={tiers.lists} onCreate={tiers.create} onUpdate={tiers.update} onDuplicate={tiers.duplicate} onDelete={tiers.remove} onImportShared={tiers.addShared} /></main></Suspense>
      : view === 'inventory' ? <Suspense fallback={<main className="loading-page">Loading inventory…</main>}><ArchiveWorkshop builds={builds} statuses={collection.statuses} elementStatuses={collection.elementStatuses} favorites={collection.favorites} onStatus={setStatus} onElementStatus={setElementStatus} onFavorite={toggleBloodlineFavorite} /></Suspense>
      : view === 'suggestions' ? <Suspense fallback={<main className="loading-page">Loading suggestions…</main>}><SuggestionsPage /></Suspense>
      : view === 'compare' ? <main className="compare-page"><header className="systems-hero"><span className="eyebrow"><Swords size={15} /> COMPARE</span><h1>Compare character builds.</h1><p>Select up to three builds from the gallery, then compare their available reviewed or draft variants.</p></header>{compared.length >= 2 ? <Suspense fallback={null}><ComparePanel builds={compared} slotLimit={4} onRemove={toggleCompare} onClose={() => navigate('builds')} /></Suspense> : <div className="empty-state"><h3>Select at least two builds</h3><button className="button button--primary" onClick={() => navigate('builds')}>Browse builds</button></div>}</main>
      : view === 'diagnostics' && import.meta.env.DEV && DiagnosticsPage ? <Suspense fallback={<main className="loading-page">Loading diagnostics…</main>}><DiagnosticsPage builds={builds} visibleCount={pageBuilds.length} filteringDuration={0} /></Suspense>
      : <main>
        <section className="archive-hero"><div className="archive-hero__copy"><span className="eyebrow">MULTI-MANHWA SHINDO LIFE ARCHIVE</span><h1>Build the fighter.<br /><i>Know the compromise.</i></h1><p>Reviewed setups and clearly labeled early drafts across Lookism, Solo Leveling, Eleceed, Murim, and more.</p></div><div className="archive-stats"><div><strong>{builds.length}</strong><span>Total characters</span></div><div><strong>{builds.filter((build) => build.publicationStatus === 'Reviewed').length}</strong><span>Reviewed builds</span></div><div><strong>{builds.filter((build) => build.publicationStatus === 'Draft').length}</strong><span>Draft builds</span></div><div><strong>{values.series.length}</strong><span>Series represented</span></div></div></section>
        <section className="controls-shell"><div className="search-wrap"><Search size={18} /><input aria-label="Search builds" value={searchInput} onChange={(event) => { setSearchInput(event.target.value); setPage(1) }} placeholder="Search character, series, arc, or Bloodline…" /></div><div className="bias-control"><span>LORE</span><input aria-label="Lore accuracy versus PvP meta" type="range" min="0" max="100" value={prefs.metaBias} onChange={(event) => setMetaBias(Number(event.target.value))} /><span>META</span></div></section>
        <section className="filter-row"><span><SlidersHorizontal size={15} /> Filters</span><select aria-label="Filter by publication status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option>Reviewed</option><option>Needs Retesting</option><option>Draft</option><option>Needs Research</option></select><select aria-label="Filter by franchise" value={filters.franchise} onChange={(e) => setFilters({ ...filters, franchise: e.target.value })}><option value="">All franchises</option>{values.franchises.map((value) => <option key={value}>{value}</option>)}</select><select aria-label="Filter by series" value={filters.series} onChange={(e) => setFilters({ ...filters, series: e.target.value })}><option value="">All series</option>{values.series.map((value) => <option key={value}>{value}</option>)}</select><select aria-label="Filter by Bloodline" value={filters.bloodline} onChange={(e) => setFilters({ ...filters, bloodline: e.target.value })}><option value="">All Bloodlines</option>{values.bloodlines.map((value) => <option key={value}>{value}</option>)}</select><select aria-label="Filter by inventory readiness" value={filters.owned} onChange={(e) => setFilters({ ...filters, owned: e.target.value })}><option value="">Any inventory</option><option value="makeable">Builds I can make</option><option value="missing-one">Missing one item</option></select><button className={`favorites-filter ${filters.favorites ? 'active' : ''}`} onClick={() => setFilters({ ...filters, favorites: filters.favorites ? '' : 'only' })}><Heart size={13} /> Favorites</button></section>
        <div className="results-bar"><div><strong>{filtered.length}</strong> ARCHIVE RESULTS</div><div className="view-switch"><button className={view === 'builds' && cardMode === 'compact' ? 'active' : ''} onClick={() => { navigate('builds'); setCardMode('compact') }} aria-label="Compact cards"><Grid2X2 size={16} /></button><button className={view === 'builds' && cardMode === 'visual' ? 'active' : ''} onClick={() => { navigate('builds'); setCardMode('visual') }} aria-label="Visual cards"><Rows3 size={16} /></button><button className={view === 'database' ? 'active' : ''} onClick={() => navigate('database')} aria-label="Table view"><Table2 size={16} /></button><button onClick={() => filtered.length && setSelected(filtered[Math.floor(Math.random() * filtered.length)])} aria-label="Random build"><Dice5 size={16} /></button></div></div>
        {view === 'database' ? <BuildTable builds={pageBuilds} slotLimit={4} onOpen={setSelected} onClear={() => setFilters(emptyFilters)} /> : <ErrorBoundary section="gallery"><Gallery builds={pageBuilds} slotLimit={4} compareIds={compareIds} favorites={prefs.favorites} onOpen={setSelected} onCompare={toggleCompare} onFavorite={toggleFavorite} onClear={() => setFilters(emptyFilters)} mode={cardMode} performanceMode={false} /></ErrorBoundary>}
        <div className="pagination"><div>{(['12', '24', '48', '96'] as const).map((size) => <button className={prefs.pageSize === size ? 'active' : ''} key={size} onClick={() => { setPageSize(size); setPage(1) }}>{size}</button>)}</div><span>{filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} OF {filtered.length}</span><div><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><ChevronLeft /></button><strong>{page}/{pageCount}</strong><button disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight /></button></div></div>
      </main>}

    <footer className="site-footer"><p>Unofficial fan-made build archive. Game balance and abilities may change. · <a href="https://discord.gg/agarthia" target="_blank" rel="noreferrer">discord.gg/agarthia</a></p></footer>
    {selected && <BuildDetail build={selected} onClose={() => setSelected(null)} />}
  </div>
}
