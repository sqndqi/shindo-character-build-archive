import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Copy, Download, Plus, RotateCcw, Search, Share2, Trash2, Trophy } from 'lucide-react'
import type { CharacterBuild } from '../types'
import type { PersonalTierList } from '../hooks/useTierLists'
import { decodeTierShare, encodeTierShare } from '../lib/tierShare'
import { Portrait } from './Portrait'

type Props = {
  builds: CharacterBuild[]
  lists: PersonalTierList[]
  onCreate: () => void
  onUpdate: (id: string, fn: (list: PersonalTierList) => PersonalTierList) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onImportShared: (list: Omit<PersonalTierList, 'id' | 'createdAt' | 'updatedAt'>) => void
}

function exportPng(list: PersonalTierList, builds: CharacterBuild[]) {
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 675
  const ctx = canvas.getContext('2d'); if (!ctx) return
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 1200, 675)
  ctx.fillStyle = '#e52332'; ctx.fillRect(0, 0, 14, 675)
  ctx.fillStyle = '#fff'; ctx.font = 'bold 42px Arial'; ctx.fillText(list.title, 48, 64)
  ctx.fillStyle = '#999'; ctx.font = '20px Arial'; ctx.fillText('Personal community tier list — not an official archive ranking.', 48, 96)
  list.rows.forEach((row, index) => {
    const y = 125 + index * 98
    ctx.fillStyle = index === 0 ? '#8e1822' : '#202020'; ctx.fillRect(48, y, 1104, 82)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Arial'; ctx.fillText(row.label, 66, y + 50)
    ctx.font = '18px Arial'
    const names = builds.filter((build) => list.assignments[build.id] === row.id).map((build) => build.name).join('  •  ')
    ctx.fillText(names.slice(0, 100), 150, y + 49)
  })
  const anchor = document.createElement('a'); anchor.href = canvas.toDataURL('image/png'); anchor.download = `${list.title.replace(/[^\w-]+/g, '-')}.png`; anchor.click()
}

export function TierListBoard({ builds, lists, onCreate, onUpdate, onDuplicate, onDelete, onImportShared }: Props) {
  const shared = useMemo(() => {
    const value = new URLSearchParams(location.hash.replace(/^#/, '')).get('tier')
    if (!value) return null
    try { return decodeTierShare(value) } catch { return null }
  }, [])
  const [activeId, setActiveId] = useState(lists[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [series, setSeries] = useState('')
  const [franchise, setFranchise] = useState('')
  const list = lists.find((item) => item.id === activeId) ?? lists[0]
  if (shared) return <div className="tier-lab"><section className="tier-hero"><div><span className="eyebrow">VIEW-ONLY SHARED LIST</span><h1>{shared.title}</h1></div><p>{shared.description || 'Personal community tier list — not an official archive ranking.'}</p></section><TierRows rows={shared.rows} assignments={shared.assignments} builds={builds} /><button className="button button--primary" onClick={() => { onImportShared({ title: shared.title, description: shared.description, selectedRoster: Object.keys(shared.assignments), rows: shared.rows, assignments: shared.assignments, coverStyle: 'Crimson', schemaVersion: 2 }); location.hash = '' }}>Copy to my tier lists</button></div>
  if (!list) return <div className="tier-lab"><button className="button button--primary" onClick={onCreate}>Create my first tier list</button></div>
  const visible = builds.filter((build) => `${build.name} ${build.series} ${build.franchise}`.toLowerCase().includes(search.toLowerCase()) && (!series || build.series === series) && (!franchise || build.franchise === franchise))
  const share = async () => {
    const payload = encodeTierShare({ title: list.title, description: list.description, rows: list.rows, assignments: list.assignments })
    const url = `${location.origin}${location.pathname}#tier=${payload}`
    if (navigator.share) await navigator.share({ title: list.title, url }).catch(() => {})
    else await navigator.clipboard.writeText(url)
  }
  return <div className="tier-lab">
    <section className="tier-hero"><div><span className="eyebrow"><Trophy size={14} /> MY TIER LISTS</span><h1>Rank your roster.</h1></div><p>Personal community tier list — not an official archive ranking.</p></section>
    <div className="tier-list-toolbar"><select aria-label="Select tier list" value={list.id} onChange={(event) => setActiveId(event.target.value)}>{lists.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select><button className="button button--outline" onClick={onCreate}><Plus size={14} /> New</button><button className="button button--outline" onClick={() => onDuplicate(list.id)}><Copy size={14} /> Duplicate</button><button className="button button--outline" onClick={share}><Share2 size={14} /> Share</button><button className="button button--outline" onClick={() => exportPng(list, builds)}><Download size={14} /> PNG</button><button className="button button--outline" onClick={() => downloadJson(list)}><Download size={14} /> JSON</button><button className="button button--outline" onClick={() => onUpdate(list.id, (current) => ({ ...current, rows: [...current.rows, { id: `row-${Date.now()}`, label: 'New tier' }] }))}><Plus size={14} /> Row</button><button className="button button--outline" onClick={() => confirm('Reset all placements?') && onUpdate(list.id, (current) => ({ ...current, assignments: {} }))}><RotateCcw size={14} /> Reset</button><button className="button button--danger" onClick={() => confirm('Delete this personal tier list?') && onDelete(list.id)}><Trash2 size={14} /> Delete</button></div>
    <div className="tier-title-fields"><input aria-label="Tier list title" value={list.title} onChange={(event) => onUpdate(list.id, (current) => ({ ...current, title: event.target.value }))} /><input aria-label="Tier list description" value={list.description} placeholder="Optional description" onChange={(event) => onUpdate(list.id, (current) => ({ ...current, description: event.target.value }))} /></div>
    <div className="tier-search"><Search size={16} /><input aria-label="Search tier characters" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search characters…" /><select aria-label="Filter tier list by series" value={series} onChange={(event) => setSeries(event.target.value)}><option value="">All series</option>{[...new Set(builds.map((build) => build.series))].map((value) => <option key={value}>{value}</option>)}</select><select aria-label="Filter tier list by franchise" value={franchise} onChange={(event) => setFranchise(event.target.value)}><option value="">All franchises</option>{[...new Set(builds.map((build) => build.franchise))].map((value) => <option key={value}>{value}</option>)}</select></div>
    <div className="tier-row-editor">{list.rows.map((row, index) => <div key={row.id}><input aria-label={`Name for tier ${index + 1}`} value={row.label} onChange={(event) => onUpdate(list.id, (current) => ({ ...current, rows: current.rows.map((item) => item.id === row.id ? { ...item, label: event.target.value } : item) }))} /><button aria-label={`Move ${row.label} up`} disabled={index === 0} onClick={() => onUpdate(list.id, (current) => ({ ...current, rows: move(current.rows, index, index - 1) }))}><ArrowUp size={13} /></button><button aria-label={`Move ${row.label} down`} disabled={index === list.rows.length - 1} onClick={() => onUpdate(list.id, (current) => ({ ...current, rows: move(current.rows, index, index + 1) }))}><ArrowDown size={13} /></button><button aria-label={`Delete ${row.label} tier`} disabled={list.rows.length <= 1} onClick={() => onUpdate(list.id, (current) => ({ ...current, rows: current.rows.filter((item) => item.id !== row.id), assignments: Object.fromEntries(Object.entries(current.assignments).filter(([, tier]) => tier !== row.id)) }))}><Trash2 size={13} /></button></div>)}</div>
    <TierRows rows={list.rows} assignments={list.assignments} builds={visible} onAssign={(buildId, rowId) => onUpdate(list.id, (current) => ({ ...current, assignments: { ...current.assignments, [buildId]: rowId } }))} />
    <section className="unranked-pool"><div><span>UNRANKED</span></div><div>{visible.filter((build) => !list.assignments[build.id]).map((build) => <TierChip key={build.id} build={build} rows={list.rows} onAssign={(row) => onUpdate(list.id, (current) => ({ ...current, assignments: { ...current.assignments, [build.id]: row } }))} />)}</div></section>
  </div>
}

function TierRows({ rows, assignments, builds, onAssign }: { rows: { id: string; label: string }[]; assignments: Record<string, string>; builds: CharacterBuild[]; onAssign?: (id: string, row: string) => void }) {
  return <div className="tier-board">{rows.map((row) => <section className="tier-row" key={row.id}><div className="tier-rank">{row.label}</div><div className="tier-members">{builds.filter((build) => assignments[build.id] === row.id).map((build) => <TierChip key={build.id} build={build} rows={rows} onAssign={(next) => onAssign?.(build.id, next)} />)}</div></section>)}</div>
}

function TierChip({ build, rows, onAssign }: { build: CharacterBuild; rows: { id: string; label: string }[]; onAssign: (row: string) => void }) {
  return <article className="tier-chip"><div className="tier-chip__portrait"><Portrait src={build.image} alt={build.name} /></div><div><strong>{build.name}</strong><span>{build.series}</span></div><select aria-label={`Tier for ${build.name}`} defaultValue="" onChange={(event) => onAssign(event.target.value)}><option value="" disabled>Move</option>{rows.map((row) => <option value={row.id} key={row.id}>{row.label}</option>)}</select></article>
}

function move<T>(items: T[], from: number, to: number) {
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function downloadJson(list: PersonalTierList) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${list.title.replace(/[^\w-]+/g, '-')}.json`; anchor.click(); URL.revokeObjectURL(url)
}
