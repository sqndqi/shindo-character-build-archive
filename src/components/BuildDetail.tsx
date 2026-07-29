import { useEffect } from 'react'
import { Copy, Pencil, RotateCcw, Trash2, X } from 'lucide-react'
import type { CharacterBuild, SlotLimit } from '../types'
import { Portrait } from './Portrait'
import { Score } from './Score'

type Props = {
  build: CharacterBuild
  slotLimit: SlotLimit
  onClose: () => void
  onEdit: () => void
  onDuplicate: () => void
  onReset: () => void
  onDelete: () => void
}

export function BuildDetail({ build, slotLimit, onClose, onEdit, onDuplicate, onReset, onDelete }: Props) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  const active = build.slotAlternatives[slotLimit === 2 ? 'twoSlots' : slotLimit === 3 ? 'threeSlots' : 'fourSlots']
  const ratingEntries = Object.entries(build.ratings).filter(([key]) => key !== 'difficulty')

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`${build.name} build details`}>
      <button className="modal-backdrop" onClick={onClose} aria-label="Close details" />
      <article className="detail-panel">
        <div className="detail-hero">
          <Portrait src={build.image} alt={build.name} />
          <div className="detail-hero__shade" />
          <button className="icon-button detail-close" onClick={onClose} aria-label="Close details"><X /></button>
          <div className="detail-hero__copy">
            <span className="eyebrow">{build.series} / {build.version}</span>
            <h2>{build.name}</h2>
            <div className="tag-row">{build.archetype.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
            <p>{build.description}</p>
          </div>
        </div>

        <div className="detail-actions">
          <button className="button button--primary" onClick={onEdit}><Pencil size={15} /> Edit build</button>
          <button className="button button--outline" onClick={onDuplicate}><Copy size={15} /> Duplicate</button>
          <button className="button button--outline" onClick={onReset}><RotateCcw size={15} /> Reset original</button>
          <button className="button button--danger" onClick={onDelete}><Trash2 size={15} /> Delete</button>
        </div>

        <div className="detail-content">
          <section>
            <div className="section-heading">
              <div><span className="section-index">01</span><h3>Build overview</h3></div>
              <span className="slot-readout">{slotLimit} SLOTS ACTIVE</span>
            </div>
            <div className="overview-grid">
              <div className="loadout-card loadout-card--wide">
                <span>Bloodlines</span>
                <div className="bloodline-list">
                  {Array.from({ length: slotLimit }).map((_, index) => (
                    <div key={index}><b>0{index + 1}</b><strong>{active[index] ?? 'Open slot'}</strong><small>{build.bloodlines.find((item) => item.name === active[index])?.purpose ?? 'Flexible utility'}</small></div>
                  ))}
                </div>
              </div>
              {[
                ['Elements', build.elements.join(' / ')],
                ['C-Mode', build.cMode],
                ['Z-Mode', build.zMode],
                ['Combat Art', build.combatArt],
                ['Weapon', build.weapon],
                ['Ninja Tool', build.ninjaTool],
                ['Consumable', build.consumable],
                ['Race / Mentor', `${build.race} / ${build.mentor}`],
              ].map(([label, value]) => <div className="loadout-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </div>
          </section>

          <section>
            <div className="section-heading"><div><span className="section-index">02</span><h3>Exact hotbar</h3></div></div>
            <div className="hotbar-grid">
              {build.hotbar.map((slot) => (
                <article className="hotbar-slot" key={slot.key}>
                  <div className="hotbar-key">{slot.key}</div>
                  <div>
                    <span>{slot.source}</span>
                    <h4>{slot.ability}</h4>
                    <p>{slot.purpose}</p>
                    <small>{slot.comboRole} · {slot.usageNotes}</small>
                  </div>
                  {slot.blockBreak && <i>BLOCK BREAK</i>}
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="section-heading"><div><span className="section-index">03</span><h3>Combo routes</h3></div></div>
            <div className="combo-list">
              {build.combos.map((combo, index) => (
                <article key={combo.name}>
                  <b>0{index + 1}</b>
                  <div><h4>{combo.name}</h4><div className="key-sequence">{combo.sequence.map((key) => <kbd key={key}>{key}</kbd>)}</div><p>{combo.explanation}</p></div>
                </article>
              ))}
            </div>
          </section>

          <section className="analysis-grid">
            <div>
              <div className="section-heading"><div><span className="section-index">04</span><h3>Performance</h3></div></div>
              <div className="rating-stack">
                {ratingEntries.map(([key, value]) => <Score key={key} label={key.toUpperCase()} value={value} />)}
              </div>
              <div className="difficulty-panel"><span>Execution difficulty</span><strong>{build.ratings.difficulty.toFixed(1)} / 10</strong></div>
            </div>
            <div>
              <div className="section-heading"><div><span className="section-index">05</span><h3>Field notes</h3></div></div>
              <div className="notes-columns">
                <div><h4>Strengths</h4><ul>{build.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><h4>Weaknesses</h4><ul>{build.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><h4>Possible substitutions</h4><ul>{build.substitutions.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
              <div className="variant-list">
                <div><span>BEGINNER</span><p>{build.variations.beginner}</p></div>
                <div><span>META</span><p>{build.variations.meta}</p></div>
                <div><span>LORE ACCURATE</span><p>{build.variations.lore}</p></div>
              </div>
              <div className="build-notes"><strong>ARCHIVIST NOTE</strong><p>{build.notes}</p></div>
            </div>
          </section>
        </div>
      </article>
    </div>
  )
}
