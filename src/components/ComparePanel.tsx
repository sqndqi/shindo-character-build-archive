import React from 'react'
import { Scale, X } from 'lucide-react'
import type { CharacterBuild, SlotLimit } from '../types'
import { Portrait } from './Portrait'

type Props = {
  builds: CharacterBuild[]
  slotLimit: SlotLimit
  onRemove: (id: string) => void
  onClose: () => void
}

export function ComparePanel({ builds, slotLimit, onRemove, onClose }: Props) {
  const slotsFor = (build: CharacterBuild) => build.slotAlternatives[slotLimit === 2 ? 'twoSlots' : slotLimit === 3 ? 'threeSlots' : 'fourSlots']
  const shared = (() => {
    if (builds.length < 2) return new Set<string>()
    return new Set(slotsFor(builds[0]).filter((name) => builds.slice(1).every((build) => slotsFor(build).includes(name))))
  })()

  const rows: Array<[string, (build: CharacterBuild) => string | number]> = [
    ['Elements', (b) => b.elements.join(' / ')],
    ['C / Z Modes', (b) => `${b.cMode} / ${b.zMode}`],
    ['Accuracy', (b) => b.ratings.accuracy.toFixed(1)],
    ['PvP', (b) => b.ratings.pvp.toFixed(1)],
    ['Mobility', (b) => b.ratings.mobility.toFixed(1)],
    ['Defense', (b) => b.ratings.defense.toFixed(1)],
    ['Difficulty', (b) => b.ratings.difficulty.toFixed(1)],
  ]

  return (
    <div className="modal-layer compare-layer" role="dialog" aria-modal="true" aria-label="Build comparison">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close comparison" />
      <section className="compare-panel">
        <header>
          <div><span className="eyebrow"><Scale size={14} /> SIDE-BY-SIDE ANALYSIS</span><h2>Build comparison</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close comparison"><X /></button>
        </header>
        <div className="compare-scroll">
          <div className="compare-grid" style={{ '--compare-count': builds.length } as React.CSSProperties}>
            <div className="compare-label" />
            {builds.map((build) => (
              <div className="compare-character" key={build.id}>
                <Portrait src={build.image} alt={build.name} />
                <div><span>{build.series}</span><h3>{build.name}</h3></div>
                <button onClick={() => onRemove(build.id)} aria-label={`Remove ${build.name}`}><X size={14} /></button>
              </div>
            ))}
            <div className="compare-label">Bloodlines</div>
            {builds.map((build) => (
              <div className="compare-bloodlines" key={`${build.id}-bloodlines`}>
                {slotsFor(build).map((name) => <span className={shared.has(name) ? 'is-shared' : ''} key={name}>{name}{shared.has(name) && <small> SHARED</small>}</span>)}
              </div>
            ))}
            {rows.map(([label, getter]) => (
              <React.Fragment key={label}>
                <div className="compare-label">{label}</div>
                {builds.map((build) => <div className="compare-value" key={`${build.id}-${label}`}>{getter(build)}</div>)}
              </React.Fragment>
            ))}
          </div>
        </div>
        <footer><span>Shared Bloodlines are marked in red. Numeric gaps of 1.0+ are major differences.</span></footer>
      </section>
    </div>
  )
}
