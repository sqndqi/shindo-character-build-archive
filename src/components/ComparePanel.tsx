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
  const variantFor = (build: CharacterBuild) => build.variants.find((variant) => variant.bloodlineSlotCount === slotLimit) ?? build.variants[0]
  const slotsFor = (build: CharacterBuild) => variantFor(build).bloodlines.map((slot) => slot.name)
  const shared = (() => {
    if (builds.length < 2) return new Set<string>()
    return new Set(slotsFor(builds[0]).filter((name) => builds.slice(1).every((build) => slotsFor(build).includes(name))))
  })()

  const rows: Array<[string, (build: CharacterBuild) => string | number]> = [
    ['Elements', (b) => variantFor(b).elements.map((item) => item.name).join(' / ')],
    ['C / Z Modes', (b) => `${variantFor(b).cMode} / ${variantFor(b).zMode}`],
    ['Accuracy', (b) => variantFor(b).ratings.accuracy.toFixed(1)],
    ['PvP', (b) => variantFor(b).ratings.pvp.toFixed(1)],
    ['Mobility', (b) => variantFor(b).ratings.mobility.toFixed(1)],
    ['Defense', (b) => variantFor(b).ratings.defense.toFixed(1)],
    ['Aura', (b) => variantFor(b).ratings.aura.toFixed(1)],
    ['Effects', (b) => b.effectsIntensity],
    ['Difficulty', (b) => variantFor(b).ratings.difficulty.toFixed(1)],
  ]
  const matchup = builds.length === 2 ? (() => {
    const score = (build: CharacterBuild) => {
      const ratings = variantFor(build).ratings
      return ratings.pvp + ratings.accuracy + ratings.mobility + ratings.defense + ratings.combos + ratings.aura
    }
    const left = score(builds[0])
    const right = score(builds[1])
    return {
      winner: left === right ? null : left > right ? builds[0] : builds[1],
      gap: Math.abs(left - right).toFixed(1),
      left: (left / 6).toFixed(1),
      right: (right / 6).toFixed(1),
    }
  })() : null

  return (
    <div className="modal-layer compare-layer" role="dialog" aria-modal="true" aria-label="Build comparison">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close comparison" />
      <section className="compare-panel">
        <header>
          <div><span className="eyebrow"><Scale size={14} /> SIDE-BY-SIDE ANALYSIS</span><h2>Build comparison</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close comparison"><X /></button>
        </header>
        {matchup && (
          <div className="matchup-verdict">
            <div><span>MATCHUP INDEX</span><strong>{builds[0].name}</strong><b>{matchup.left}</b></div>
            <div><small>PROJECTED EDGE</small><strong>{matchup.winner ? matchup.winner.name : 'EVEN MATCH'}</strong><span>{matchup.gap} POINT GAP</span></div>
            <div><span>MATCHUP INDEX</span><strong>{builds[1].name}</strong><b>{matchup.right}</b></div>
          </div>
        )}
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
