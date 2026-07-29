import { useMemo, useState } from 'react'
import { Archive, Grid2X2, Info, ListFilter, Plus, Search, SlidersHorizontal, Swords, Table2, X } from 'lucide-react'
import { createBlankBuild } from './data/characters'
import { useBuilds } from './hooks/useBuilds'
import type { CharacterBuild, SlotLimit } from './types'
import { Gallery } from './components/Gallery'
import { BuildTable } from './components/BuildTable'
import { BuildDetail } from './components/BuildDetail'
import { BuildEditor } from './components/BuildEditor'
import { ComparePanel } from './components/ComparePanel'

type View = 'gallery' | 'table' | 'about'

const emptyFilters = { search: '', series: '', combat: '', bloodline: '', slots: '', type: '' }

function App() {
  const { builds, save, add, remove, reset, resetAll } = useBuilds()
  const [view, setView] = useState<View>('gallery')
  const [slotLimit, setSlotLimit] = useState<SlotLimit>(4)
  const [filters, setFilters] = useState(emptyFilters)
  const [selected, setSelected] = useState<CharacterBuild | null>(null)
  const [editing, setEditing] = useState<CharacterBuild | null>(null)
  const [creating, setCreating] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  const values = useMemo(() => ({
    series: [...new Set(builds.map((b) => b.series))].sort(),
    combat: [...new Set(builds.map((b) => b.combatArt))].sort(),
    bloodline: [...new Set(builds.flatMap((b) => b.bloodlines.map((x) => x.name)))].sort(),
    type: [...new Set(builds.flatMap((b) => b.archetype))].sort(),
  }), [builds])

  const filtered = useMemo(() => builds.filter((build) => {
    const query = filters.search.toLowerCase()
    const searchMatch = !query || [build.name, build.series, build.version, ...build.archetype, ...build.bloodlines.map((b) => b.name)].join(' ').toLowerCase().includes(query)
    return searchMatch
      && (!filters.series || build.series === filters.series)
      && (!filters.combat || build.combatArt === filters.combat)
      && (!filters.bloodline || build.bloodlines.some((item) => item.name === filters.bloodline))
      && (!filters.slots || build.bloodlines.length === Number(filters.slots))
      && (!filters.type || build.archetype.includes(filters.type))
  }), [builds, filters])

  const compared = compareIds.map((id) => builds.find((build) => build.id === id)).filter(Boolean) as CharacterBuild[]
  const clearFilters = () => setFilters(emptyFilters)
  const hasFilters = Object.values(filters).some(Boolean)
  const setFilter = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value }))

  const toggleCompare = (id: string) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current)
  const duplicate = (build: CharacterBuild) => {
    const copy = structuredClone(build)
    copy.id = `${build.id}-copy-${Date.now()}`
    copy.name = `${build.name} Copy`
    copy.status = 'Draft'
    add(copy)
    setSelected(copy)
  }

  const deleteBuild = (build: CharacterBuild) => {
    if (!window.confirm(`Delete ${build.name} from this local archive?`)) return
    remove(build.id)
    setCompareIds((current) => current.filter((id) => id !== build.id))
    setSelected(null)
  }

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
          <button className={view === 'about' ? 'active' : ''} onClick={() => setView('about')}><Info size={16} /> About</button>
        </nav>
        <button className="button button--primary add-build" onClick={() => { setEditing(createBlankBuild()); setCreating(true) }}><Plus size={16} /> Add build</button>
      </header>

      {view !== 'about' ? (
        <main>
          <section className="archive-hero">
            <div className="archive-hero__copy">
              <span className="eyebrow">FAN-MADE COMBAT INTELLIGENCE / V1.0</span>
              <h1>Build the fighter.<br /><i>Archive the legend.</i></h1>
              <p>A tactical database of manhwa-inspired Shindo Life builds, tuned for identity, execution, and live PvP.</p>
            </div>
            <div className="archive-stats">
              <div><strong>{builds.length.toString().padStart(2, '0')}</strong><span>Archived fighters</span></div>
              <div><strong>{values.series.length.toString().padStart(2, '0')}</strong><span>Series indexed</span></div>
              <div><strong>{builds.filter((b) => b.status === 'Complete').length.toString().padStart(2, '0')}</strong><span>Combat ready</span></div>
            </div>
          </section>

          <section className="controls-shell">
            <div className="search-wrap"><Search size={18} /><input aria-label="Search builds" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} placeholder="Search fighter, series, Bloodline..." />{filters.search && <button onClick={() => setFilter('search', '')} aria-label="Clear search"><X size={15} /></button>}</div>
            <div className="slot-control">
              <span>ACTIVE BLOODLINE SLOTS</span>
              <div>{([2, 3, 4] as SlotLimit[]).map((count) => <button className={slotLimit === count ? 'active' : ''} key={count} onClick={() => setSlotLimit(count)}>{count}</button>)}</div>
            </div>
          </section>

          <section className="filter-row">
            <span><SlidersHorizontal size={15} /> Filter archive</span>
            <select aria-label="Filter by series" value={filters.series} onChange={(e) => setFilter('series', e.target.value)}><option value="">All series</option>{values.series.map((v) => <option key={v}>{v}</option>)}</select>
            <select aria-label="Filter by combat style" value={filters.combat} onChange={(e) => setFilter('combat', e.target.value)}><option value="">All combat styles</option>{values.combat.map((v) => <option key={v}>{v}</option>)}</select>
            <select aria-label="Filter by Bloodline" value={filters.bloodline} onChange={(e) => setFilter('bloodline', e.target.value)}><option value="">All Bloodlines</option>{values.bloodline.map((v) => <option key={v}>{v}</option>)}</select>
            <select aria-label="Filter by Bloodline count" value={filters.slots} onChange={(e) => setFilter('slots', e.target.value)}><option value="">Any slot count</option><option value="2">2 Bloodlines</option><option value="3">3 Bloodlines</option><option value="4">4 Bloodlines</option></select>
            <select aria-label="Filter by build type" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}><option value="">All build types</option>{values.type.map((v) => <option key={v}>{v}</option>)}</select>
            {hasFilters && <button className="clear-filter" onClick={clearFilters}>Clear all</button>}
          </section>

          <div className="results-bar">
            <div><ListFilter size={14} /><strong>{filtered.length}</strong> RESULTS <span>/</span> {slotLimit}-SLOT CONFIGURATION</div>
            <div className="view-switch">
              <button className={view === 'gallery' ? 'active' : ''} onClick={() => setView('gallery')} aria-label="Gallery view"><Grid2X2 size={16} /></button>
              <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} aria-label="Table view"><Table2 size={16} /></button>
            </div>
          </div>

          {view === 'gallery'
            ? <Gallery builds={filtered} slotLimit={slotLimit} compareIds={compareIds} onOpen={setSelected} onCompare={toggleCompare} onClear={clearFilters} />
            : <BuildTable builds={filtered} slotLimit={slotLimit} onOpen={setSelected} onClear={clearFilters} />}
        </main>
      ) : (
        <main className="about-page">
          <span className="eyebrow">ABOUT THE ARCHIVE</span>
          <h1>Built for theorycrafters,<br /><i>not tier-list tourists.</i></h1>
          <div className="about-grid">
            <section><span>01</span><h2>What this is</h2><p>A local, fan-made visual archive that translates Lookism and other manhwa fighters into playable Shindo Life build concepts. Accuracy scores measure theme fit, not canon power scaling.</p></section>
            <section><span>02</span><h2>How data is saved</h2><p>Every edit, duplicate, and custom character stays in your browser through localStorage. There is no account, backend, analytics, or cloud sync.</p></section>
            <section><span>03</span><h2>Disclaimer</h2><p>This project is unofficial and is not affiliated with RELL Games, Roblox, or the creators and publishers of the referenced manhwa. Game balance, move behavior, and availability can change after updates.</p></section>
            <section><span>04</span><h2>Reset archive</h2><p>Restore all starter builds if you want a clean slate. This replaces locally edited data.</p><button className="button button--danger" onClick={() => window.confirm('Reset every local edit and restore the starter archive?') && resetAll()}>Reset all local data</button></section>
          </div>
        </main>
      )}

      <footer className="site-footer"><span>SHINDO CHARACTER BUILD ARCHIVE</span><p>Fan-made database · Balance can change · Data saved locally</p></footer>

      {compareIds.length > 0 && !compareOpen && (
        <div className="compare-tray">
          <div><Swords size={18} /><span><strong>{compareIds.length}/3</strong> selected</span>{compared.map((b) => <button key={b.id} onClick={() => toggleCompare(b.id)}>{b.name}<X size={12} /></button>)}</div>
          <button className="button button--primary" disabled={compareIds.length < 2} onClick={() => setCompareOpen(true)}>Compare builds</button>
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
            setSelected(build)
            setEditing(null)
            setCreating(false)
          }}
        />
      )}
      {compareOpen && <ComparePanel builds={compared} slotLimit={slotLimit} onRemove={toggleCompare} onClose={() => setCompareOpen(false)} />}
    </div>
  )
}

export default App
