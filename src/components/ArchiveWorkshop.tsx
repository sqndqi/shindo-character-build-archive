import { useMemo, useState, type ChangeEvent } from 'react'
import { Download, FlaskConical, Heart, ShieldCheck, Upload } from 'lucide-react'
import type { CharacterBuild } from '../types'
import type { OwnershipStatus } from '../hooks/useBloodlineCollection'
import { exportArchive, importArchive } from '../services/archiveIO'

type Props = {
  builds: CharacterBuild[]
  statuses: Record<string, OwnershipStatus>
  favorites: string[]
  onStatus: (name: string, status: OwnershipStatus) => void
  onFavorite: (name: string) => void
  onImport: (builds: CharacterBuild[]) => void
  onCreate: () => void
}

function download(value: string) {
  const url = URL.createObjectURL(new Blob([value], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `shindo-archive-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function ArchiveWorkshop({ builds, statuses, favorites, onStatus, onFavorite, onImport, onCreate }: Props) {
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const bloodlines = useMemo(() => [...new Set(builds.flatMap((build) => build.bloodlines.map((slot) => slot.name)))].sort(), [builds])
  const visible = bloodlines.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
  const owned = bloodlines.filter((name) => statuses[name] === 'Owned').length
  const makeable = builds.filter((build) => build.bloodlines.every((slot) => statuses[slot.name] === 'Owned')).length

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const result = importArchive(await file.text())
      if (result.errors.length) {
        setMessage(`${result.errors.length} damaged record(s) were skipped. Review Diagnostics before replacing data.`)
        return
      }
      if (window.confirm(`Import ${result.builds.length} validated builds? A migration backup already protects the current archive.`)) {
        onImport(result.builds)
        setMessage(`Imported ${result.builds.length} validated builds.`)
      }
    } catch {
      setMessage('Import failed safely. Existing data was not changed.')
    }
  }

  return (
    <main className="workshop-page">
      <header className="systems-hero"><span className="eyebrow"><FlaskConical size={15} /> BUILD WORKSHOP</span><h1>Own the parts.<br /><i>Control the archive.</i></h1><p>Collection readiness, validated backups, custom builds, and update status live in one local-only workspace.</p></header>
      <section className="workshop-metrics">
        <article><span>OWNED BLOODLINES</span><strong>{owned}/{bloodlines.length}</strong><small>{bloodlines.length ? Math.round(owned / bloodlines.length * 100) : 0}% owned</small></article>
        <article><span>MAKEABLE BUILDS</span><strong>{makeable}</strong><small>All listed Bloodlines owned</small></article>
        <article><span>NEEDS RETESTING</span><strong>{builds.filter((build) => build.verificationStatus === 'Needs Retesting').length}</strong><small>Never silently marked current</small></article>
      </section>
      <section className="workshop-actions">
        <button className="button button--primary" onClick={onCreate}><FlaskConical size={15} /> New custom build</button>
        <button className="button button--outline" onClick={() => download(exportArchive(builds))}><Download size={15} /> Export JSON backup</button>
        <label className="button button--outline"><Upload size={15} /> Import validated JSON<input type="file" accept="application/json" onChange={importFile} /></label>
        {message && <p role="status">{message}</p>}
      </section>
      <section className="bloodline-vault">
        <header><div><ShieldCheck size={18} /><h2>Owned Bloodline collection</h2></div><input aria-label="Search Bloodline collection" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Bloodlines…" /></header>
        <div>{visible.map((name) => (
          <article key={name}>
            <button className={favorites.includes(name) ? 'is-favorite' : ''} onClick={() => onFavorite(name)} aria-label={`${favorites.includes(name) ? 'Unfavorite' : 'Favorite'} ${name}`}><Heart size={15} fill={favorites.includes(name) ? 'currentColor' : 'none'} /></button>
            <strong>{name}</strong>
            <select aria-label={`Ownership status for ${name}`} value={statuses[name] ?? 'Not owned'} onChange={(event) => onStatus(name, event.target.value as OwnershipStatus)}>
              <option>Owned</option><option>Not owned</option><option>Locked</option><option>Wanted</option>
            </select>
          </article>
        ))}</div>
      </section>
    </main>
  )
}
