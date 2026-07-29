import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Download, Gauge, ShieldCheck } from 'lucide-react'
import { databaseDiagnostics } from '../services/migration'
import { storageBytes } from '../services/storage'
import { buildSchema } from '../lib/validation'
import type { CharacterBuild } from '../types'

type Props = { builds: CharacterBuild[]; visibleCount: number; filteringDuration: number }

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function DiagnosticsPage({ builds, visibleCount, filteringDuration }: Props) {
  const diagnostics = useMemo(() => databaseDiagnostics(builds), [builds])
  const renders = useRef(0)
  renders.current += 1
  const [fpsEnabled, setFpsEnabled] = useState(false)
  const [fps, setFps] = useState(0)

  useEffect(() => {
    if (!fpsEnabled) return
    let frames = 0
    let frame = 0
    let start = performance.now()
    const tick = (now: number) => {
      frames += 1
      if (now - start >= 1000) {
        setFps(Math.round(frames * 1000 / (now - start)))
        frames = 0
        start = now
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [fpsEnabled])

  const damaged = builds.filter((build) => !buildSchema.safeParse(build).success)
  const cards = [
    ['Character count', diagnostics.characterCount],
    ['Unique IDs', diagnostics.uniqueIdCount],
    ['Duplicate IDs', diagnostics.duplicateIdCount],
    ['Duplicate names', diagnostics.duplicateNames.length],
    ['Missing images', diagnostics.missingImages.length],
    ['Invalid Bloodlines', diagnostics.invalidBloodlines],
    ['Invalid hotbar entries', diagnostics.invalidHotbarEntries],
    ['Corrupted records', diagnostics.corruptedRecords],
    ['Storage size', `${(storageBytes() / 1024).toFixed(1)} KB`],
    ['Schema version', diagnostics.schemaVersion],
  ]

  return (
    <main className="diagnostics-page">
      <header className="systems-hero">
        <span className="eyebrow"><ShieldCheck size={15} /> DEVELOPMENT DIAGNOSTICS</span>
        <h1>Archive health,<br /><i>without guesswork.</i></h1>
        <p>The versioned migration backs up local data, repairs identity corruption, and never merges distinct arc versions.</p>
      </header>
      <section className="diagnostic-grid">
        {cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
      </section>
      <section className="performance-panel">
        <div><Gauge /><span>Visible cards</span><strong>{visibleCount}</strong></div>
        <div><Activity /><span>Page renders</span><strong>{renders.current}</strong></div>
        <div><span>Filtering</span><strong>{filteringDuration.toFixed(2)} ms</strong></div>
        <div><span>Loaded images</span><strong>{typeof document === 'undefined' ? 0 : [...document.images].filter((image) => image.complete).length}</strong></div>
        <button className="button button--outline" onClick={() => setFpsEnabled((value) => !value)}>{fpsEnabled ? `FPS ${fps} · Stop` : 'Measure FPS'}</button>
      </section>
      <section className="diagnostic-details">
        <article><h2>Duplicate names</h2><p>{diagnostics.duplicateNames.length ? diagnostics.duplicateNames.map(([name, count]) => `${name} (${count})`).join(', ') : 'None detected.'}</p></article>
        <article><h2>Missing portraits</h2><p>{diagnostics.missingImages.join(', ') || 'None detected.'}</p></article>
        <button className="button button--outline" disabled={!damaged.length} onClick={() => downloadJson('damaged-shindo-records.json', damaged)}><Download size={15} /> Export damaged records</button>
      </section>
    </main>
  )
}
