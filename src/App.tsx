import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Archive, Bug, ChevronLeft, ChevronRight, Dice5, Disc3, FlaskConical, Grid2X2, Heart, Info, ListFilter, Plus, Rows3, Search, SlidersHorizontal, Swords, Table2, Trophy, X } from 'lucide-react'
import { createBlankBuild } from './data/characters'
import { useBuilds } from './hooks/useBuilds'
import { useArchivePrefs } from './hooks/useArchivePrefs'
import type { CharacterBuild, SlotLimit } from './types'
import { Gallery } from './components/Gallery'
import { BuildTable } from './components/BuildTable'
import { BuildDetail } from './components/BuildDetail'
import { BuildEditor } from './components/BuildEditor'
import { WheelModal } from './components/WheelModal'
import { createDuplicateName, createPermanentId } from './lib/identity'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useBloodlineCollection } from './hooks/useBloodlineCollection'

const ComparePanel = lazy(() => import('./components/ComparePanel').then((module) => ({ default: module.ComparePanel })))
const TierListBoard = lazy(() => import('./components/TierListBoard').then((module) => ({ default: module.TierListBoard })))
const DiagnosticsPage = lazy(() => import('./components/DiagnosticsPage'))
const ArchiveWorkshop = lazy(() => import('./components/ArchiveWorkshop'))

type View = 'gallery' | 'table' | 'tiers' | 'workshop' | 'diagnostics' | 'about'

const emptyFilters = {
  search: '',
  franchise: '',
  series: '',
  combat: '',
  combatTag: '',
  bloodline: '',
  slots: '',
  type: '',
  effects: '',
  favorites: '',
  owned: '',
}

function App() {
  const { builds, save, add, remove, reset, resetAll, replaceAll } = useBuilds()
  const { prefs, toggleFavorite, setTier, setPageSize, setMetaBias } = useArchivePrefs()
  const { collection, setStatus: setBloodlineStatus, toggleFavorite: toggleBloodlineFavorite } = useBloodlineCollection()
  const [view, setView] = useState<View>('gallery')
  const [cardMode, setCardMode] = useState<'compact' | 'visual'>('compact')
  const [performanceMode, setPerformanceMode] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput)
  const filteringDuration = useRef(0)
  const [slotLimit, setSlotLimit] = useState<SlotLimit>(4)
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<CharacterBuild | null>(null)
  const [editing, setEditing] = useState<CharacterBuild | null>(null)
  const [creating, setCreating] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [wheelOpen, setWheelOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [lastDeleted, setLastDeleted] = useState<CharacterBuild | null>(null)

  const values = useMemo(() => ({
    franchise: [...new Set(builds.map((build) => build.franchise))].sort(),
    series: [...new Set(builds.map((build) => build.series))].sort(),
    combat: [...new Set(builds.map((build) => build.combatArt))].sort(),
    combatTag: [...new Set(builds.flatMap((build) => build.combatTags))].sort(),
    bloodline: [...new Set(builds.flatMap((build) => build.bloodlines.map((slot) => slot.name)))].sort(),
    type: [...new Set(builds.flatMap((build) => build.archetype))].sort(),
  }), [builds])

  const filtered = useMemo(() => {
    const started = performance.now()
    const metaWeight = prefs.metaBias / 100
    const result = builds.filter((build) => {
      const query = debouncedSearch.toLowerCase()
      const searchMatch = !query || [
        build.name,
        build.series,
        build.franchise,
        build.version,
        ...build.archetype,
        ...build.combatTags,
        ...build.customTags,
        ...build.bloodlines.map((slot) => slot.name),
      ].join(' ').toLowerCase().includes(query)
      const missingBloodlines = build.bloodlines.filter((slot) => collection.statuses[slot.name] !== 'Owned').length
      return searchMatch
        && (!filters.franchise || build.franchise === filters.franchise)
        && (!filters.series || build.series === filters.series)
        && (!filters.combat || build.combatArt === filters.combat)
        && (!filters.combatTag || build.combatTags.includes(filters.combatTag))
        && (!filters.bloodline || build.bloodlines.some((slot) => slot.name === filters.bloodline))
        && (!filters.slots || build.bloodlines.length === Number(filters.slots))
        && (!filters.type || build.archetype.includes(filters.type))
        && (!filters.effects || build.effectsIntensity === filters.effects)
        && (!filters.favorites || prefs.favorites.includes(build.id))
        && (!filters.owned || (filters.owned === 'makeable' ? missingBloodlines === 0 : missingBloodlines <= 1))
    }).sort((left, right) => {
      const leftScore = left.ratings.accuracy * (1 - metaWeight) + left.ratings.pvp * metaWeight
      const rightScore = right.ratings.accuracy * (1 - metaWeight) + right.ratings.pvp * metaWeight
      return rightScore - leftScore
    })
    filteringDuration.current = performance.now() - started
    return result
  }, [builds, collection.statuses, debouncedSearch, filters, prefs.favorites, prefs.metaBias])

  const pageSize = Number(prefs.pageSize)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageBuilds = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount))
  }, [pageCount])
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])

  const compared = compareIds.map((id) => builds.find((build) => build.id === id)).filter(Boolean) as CharacterBuild[]
  const clearFilters = () => { setFilters(emptyFilters); setSearchInput(''); setPage(1) }
  const hasFilters = Boolean(debouncedSearch) || Object.values(filters).some(Boolean)
  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const toggleCompare = useCallback((id: string) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current), [])
  const randomBuild = () => {
    if (!filtered.length) return
    setSelected(filtered[Math.floor(Math.random() * filtered.length)])
  }
  const duplicate = (build: CharacterBuild) => {
    const copy = structuredClone(build)
    copy.id = createPermanentId('build')
    copy.versionId = createPermanentId('version')
    copy.name = createDuplicateName(build.name, builds.map((item) => item.name))
    copy.buildName = copy.name
    copy.status = 'Draft'
    copy.createdAt = new Date().toISOString()
    copy.updatedAt = copy.createdAt
    copy.changeHistory = []
    add(copy)
    setSelected(copy)
  }

  const deleteBuild = (build: CharacterBuild) => {
    if (!window.confirm(`Delete ${build.name} from this local archive?`)) return
    remove(build.id)
    setLastDeleted(structuredClone(build))
    setNotice(`${build.name} deleted.`)
    setCompareIds((current) => current.filter((id) => id !== build.id))
    setSelected(null)
  }

  const pagination = (
    <div className="pagination">
      <div>
        <span>SHOW</span>
        {(['12', '24', '48', '96'] as const).map((size) => <button className={prefs.pageSize === size ? 'active' : ''} key={size} onClick={() => { setPageSize(size); setPage(1) }}>{size}</button>)}
      </div>
      <span>{filtered.length ? (page - 1) * pageSize + 1 : 0}—{Math.min(page * pageSize, filtered.length)} OF {filtered.length}</span>
      <div>
        <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page"><ChevronLeft size={15} /></button>
        <strong>{page} / {pageCount}</strong>
        <button disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={15} /></button>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => setView('gallery')}>
          <span className="brand-mark"><Archive size={22} /></span>
          <span><b>SHINDO</b><strong>CHARACTER BUILD ARCHIVE</strong></span>
        </button>
        <nav aria-label="Primary navigation">
          <button className={view === 'gallery' ? 'active' : ''} onClick={() => setView('gallery')}><Grid2X2 size={16} /> Gallery</button>
          <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}><Table2 size={16} /> Database</button>
          <button className={view === 'tiers' ? 'active' : ''} onClick={() => setView('tiers')}><Trophy size={16} /> Tier Lab</button>
          <button className={view === 'workshop' ? 'active' : ''} onClick={() => setView('workshop')}><FlaskConical size={16} /> Workshop</button>
          <button className={view === 'diagnostics' ? 'active' : ''} onClick={() => setView('diagnostics')}><Bug size={16} /> Diagnostics</button>
          <button className={view === 'about' ? 'active' : ''} onClick={() => setView('about')}><Info size={16} /> About</button>
        </nav>
        <button className="button button--primary add-build" onClick={() => { setEditing(createBlankBuild()); setCreating(true) }}><Plus size={16} /> Add build</button>
      </header>

      {view === 'tiers' ? (
        <Suspense fallback={<main className="loading-page">Loading tier lab…</main>}><main><TierListBoard builds={builds} assignments={prefs.tiers} onAssign={setTier} onOpen={setSelected} /></main></Suspense>
      ) : view === 'workshop' ? (
        <Suspense fallback={<main className="loading-page">Opening workshop…</main>}><ArchiveWorkshop builds={builds} statuses={collection.statuses} favorites={collection.favorites} onStatus={setBloodlineStatus} onFavorite={toggleBloodlineFavorite} onImport={replaceAll} onCreate={() => { setEditing(createBlankBuild()); setCreating(true) }} /></Suspense>
      ) : view === 'diagnostics' ? (
        <Suspense fallback={<main className="loading-page">Reading archive health…</main>}><DiagnosticsPage builds={builds} visibleCount={pageBuilds.length} filteringDuration={filteringDuration.current} /></Suspense>
      ) : view !== 'about' ? (
        <main>
          <section className="archive-hero">
            <div className="archive-hero__copy">
              <span className="eyebrow">FAN-MADE COMBAT INTELLIGENCE / V2.0</span>
              <h1>Build the fighter.<br /><i>Archive the legend.</i></h1>
              <p>A tactical database of manhwa-inspired Shindo Life builds, tuned for identity, execution, and live PvP.</p>
            </div>
            <div className="archive-stats">
              <div><strong>{builds.length.toString().padStart(2, '0')}</strong><span>Archived builds</span></div>
              <div><strong>{values.franchise.length.toString().padStart(2, '0')}</strong><span>Franchises indexed</span></div>
              <div><strong>{prefs.favorites.length.toString().padStart(2, '0')}</strong><span>Favorites</span></div>
            </div>
          </section>

          <section className="controls-shell">
            <div className="search-wrap"><Search size={18} /><input aria-label="Search builds" value={searchInput} onChange={(event) => { setSearchInput(event.target.value); setPage(1) }} placeholder="Search fighter, franchise, tag, Bloodline..." />{searchInput && <button onClick={() => setSearchInput('')} aria-label="Clear search"><X size={15} /></button>}</div>
            <div className="slot-control">
              <span>ACTIVE BLOODLINE SLOTS</span>
              <div>{([2, 3, 4] as SlotLimit[]).map((count) => <button className={slotLimit === count ? 'active' : ''} key={count} onClick={() => setSlotLimit(count)}>{count}</button>)}</div>
            </div>
          </section>

          <section className="archive-tools">
            <div className="bias-control">
              <span>ACCURACY</span>
              <input aria-label="Accuracy versus meta bias" type="range" min="0" max="100" value={prefs.metaBias} onChange={(event) => setMetaBias(Number(event.target.value))} />
              <span>META</span>
              <strong>{prefs.metaBias}% META</strong>
            </div>
            <div>
              <button className="button button--outline" onClick={randomBuild}><Dice5 size={15} /> Random build</button>
              <button className="button button--outline" onClick={() => setWheelOpen(true)}><Disc3 size={15} /> Spin wheel</button>
            </div>
          </section>

          <section className="filter-row">
            <span><SlidersHorizontal size={15} /> Filter archive</span>
            <select aria-label="Filter by franchise" value={filters.franchise} onChange={(event) => setFilter('franchise', event.target.value)}><option value="">All franchises</option>{values.franchise.map((value) => <option key={value}>{value}</option>)}</select>
            <select aria-label="Filter by series" value={filters.series} onChange={(event) => setFilter('series', event.target.value)}><option value="">All series</option>{values.series.map((value) => <option key={value}>{value}</option>)}</select>
            <select aria-label="Filter by combat category" value={filters.combatTag} onChange={(event) => setFilter('combatTag', event.target.value)}><option value="">All combat categories</option>{values.combatTag.map((value) => <option key={value}>{value}</option>)}</select>
            <select aria-label="Filter by combat style" value={filters.combat} onChange={(event) => setFilter('combat', event.target.value)}><option value="">All combat styles</option>{values.combat.map((value) => <option key={value}>{value}</option>)}</select>
            <select aria-label="Filter by Bloodline" value={filters.bloodline} onChange={(event) => setFilter('bloodline', event.target.value)}><option value="">All Bloodlines</option>{values.bloodline.map((value) => <option key={value}>{value}</option>)}</select>
            <select aria-label="Filter by Bloodline count" value={filters.slots} onChange={(event) => setFilter('slots', event.target.value)}><option value="">Any slot count</option><option value="2">2 Bloodlines</option><option value="3">3 Bloodlines</option><option value="4">4 Bloodlines</option></select>
            <select aria-label="Filter by build type" value={filters.type} onChange={(event) => setFilter('type', event.target.value)}><option value="">All build types</option>{values.type.map((value) => <option key={value}>{value}</option>)}</select>
            <select aria-label="Filter by effects intensity" value={filters.effects} onChange={(event) => setFilter('effects', event.target.value)}><option value="">Any effects level</option><option>Low</option><option>Medium</option><option>High</option><option>Ridiculous</option></select>
            <select aria-label="Filter by owned Bloodlines" value={filters.owned} onChange={(event) => setFilter('owned', event.target.value)}><option value="">Any collection readiness</option><option value="makeable">Only builds I can make</option><option value="missing-one">Missing at most one Bloodline</option></select>
            <button className={`favorites-filter ${filters.favorites ? 'active' : ''}`} onClick={() => setFilter('favorites', filters.favorites ? '' : 'only')}><Heart size={13} fill={filters.favorites ? 'currentColor' : 'none'} /> Favorites</button>
            {hasFilters && <button className="clear-filter" onClick={clearFilters}>Clear all</button>}
          </section>

          <div className="results-bar">
            <div><ListFilter size={14} /><strong>{filtered.length}</strong> RESULTS <span>/</span> {slotLimit}-SLOT CONFIGURATION</div>
            <div className="view-switch">
              <button className={view === 'gallery' && cardMode === 'compact' ? 'active' : ''} onClick={() => { setView('gallery'); setCardMode('compact') }} aria-label="Compact cards"><Grid2X2 size={16} /></button>
              <button className={view === 'gallery' && cardMode === 'visual' ? 'active' : ''} onClick={() => { setView('gallery'); setCardMode('visual') }} aria-label="Visual cards"><Rows3 size={16} /></button>
              <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} aria-label="Table view"><Table2 size={16} /></button>
              <button className={performanceMode ? 'active' : ''} onClick={() => setPerformanceMode((value) => !value)} aria-label="Toggle virtualized performance mode" title="Paint only cards near the viewport"><Bug size={16} /></button>
            </div>
          </div>

          {view === 'gallery'
            ? <ErrorBoundary section="gallery"><Gallery builds={pageBuilds} slotLimit={slotLimit} compareIds={compareIds} favorites={prefs.favorites} onOpen={setSelected} onCompare={toggleCompare} onFavorite={toggleFavorite} onClear={clearFilters} mode={cardMode} performanceMode={performanceMode} /></ErrorBoundary>
            : <BuildTable builds={pageBuilds} slotLimit={slotLimit} onOpen={setSelected} onClear={clearFilters} />}
          {pagination}
        </main>
      ) : (
        <main className="about-page">
          <span className="eyebrow">ABOUT THE ARCHIVE</span>
          <h1>Built for theorycrafters,<br /><i>not tier-list tourists.</i></h1>
          <div className="about-grid">
            <section><span>01</span><h2>What this is</h2><p>A local, fan-made visual archive translating 90 character and arc-specific concepts into playable Shindo Life builds. Accuracy scores measure theme fit, not canon power scaling.</p></section>
            <section><span>02</span><h2>How data is saved</h2><p>Edits, favorites, tier placements, duplicates, and custom characters stay in your browser through localStorage. There is no account, backend, analytics, or cloud sync.</p></section>
            <section><span>03</span><h2>Disclaimer</h2><p>This project is unofficial and is not affiliated with RELL Games, Roblox, or the creators and publishers of the referenced manhwa. Game balance, move behavior, and availability can change after updates.</p></section>
            <section><span>04</span><h2>Reset archive</h2><p>Restore all starter builds if you want a clean slate. This replaces locally edited build data.</p><button className="button button--danger" onClick={() => window.confirm('Reset every local build edit and restore the starter archive?') && resetAll()}>Reset all build data</button></section>
          </div>
        </main>
      )}

      <footer className="site-footer"><span>SHINDO CHARACTER BUILD ARCHIVE</span><p>Fan-made database · Balance can change · Data saved locally · <a href="https://discord.gg/agarthia" target="_blank" rel="noreferrer">discord.gg/agarthia</a></p></footer>

      {compareIds.length > 0 && !compareOpen && (
        <div className="compare-tray">
          <div><Swords size={18} /><span><strong>{compareIds.length}/3</strong> selected</span>{compared.map((build) => <button key={build.id} onClick={() => toggleCompare(build.id)}>{build.name}<X size={12} /></button>)}</div>
          <button className="button button--primary" disabled={compareIds.length < 2} onClick={() => setCompareOpen(true)}>{compareIds.length === 2 ? 'Open matchup' : 'Compare builds'}</button>
        </div>
      )}

      {selected && !editing && (
        <BuildDetail
          build={selected}
          slotLimit={slotLimit}
          onClose={() => setSelected(null)}
          onEdit={() => setEditing(selected)}
          onDuplicate={() => duplicate(selected)}
          onReset={() => { if (window.confirm(`Reset ${selected.name} to its original data?`)) { reset(selected.id); setSelected(null) } }}
          onDelete={() => deleteBuild(selected)}
        />
      )}
      {editing && (
        <BuildEditor
          build={editing}
          title={creating ? 'Add new build' : `Edit ${editing.name}`}
          onClose={() => { setEditing(null); setCreating(false) }}
          onSave={(build) => {
            if (creating) add(build)
            else save(build)
            setNotice(`${build.name} saved locally.`)
            setSelected(build)
            setEditing(null)
            setCreating(false)
          }}
        />
      )}
      {compareOpen && <Suspense fallback={null}><ComparePanel builds={compared} slotLimit={slotLimit} onRemove={toggleCompare} onClose={() => setCompareOpen(false)} /></Suspense>}
      {wheelOpen && <WheelModal builds={filtered} onClose={() => setWheelOpen(false)} onOpen={(build) => { setWheelOpen(false); setSelected(build) }} />}
      {notice && <div className="toast" role="status"><span>{notice}</span>{lastDeleted && <button onClick={() => { add(lastDeleted); setNotice(`${lastDeleted.name} restored.`); setLastDeleted(null) }}>Undo</button>}<button aria-label="Dismiss notification" onClick={() => { setNotice(''); setLastDeleted(null) }}><X size={14} /></button></div>}
    </div>
  )
}

export default App
