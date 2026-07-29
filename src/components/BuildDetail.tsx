import { useEffect, useMemo, useRef, useState } from 'react'
import { Clipboard, X } from 'lucide-react'
import type { CharacterBuild } from '../types'
import { Portrait } from './Portrait'
import { Score } from './Score'

export function BuildDetail({ build, onClose }: { build: CharacterBuild; onClose: () => void }) {
  const [variantId, setVariantId] = useState(build.variants[0].id)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const variant = build.variants.find((item) => item.id === variantId) ?? build.variants[0]
  const bloodlineCounts = useMemo(() => [...new Set(build.variants.map((item) => item.bloodlineSlotCount))], [build])
  const elementCounts = useMemo(() => [...new Set(build.variants.filter((item) => item.bloodlineSlotCount === variant.bloodlineSlotCount).map((item) => item.elementSlotCount))], [build, variant.bloodlineSlotCount])
  useEffect(() => {
    closeRef.current?.focus()
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled), a[href]')
        if (!focusable?.length) return
        const first = focusable[0], last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    addEventListener('keydown', handler)
    return () => removeEventListener('keydown', handler)
  }, [onClose])
  const choose = (bloodlines: number, elements: number) => { const prepared = build.variants.find((item) => item.bloodlineSlotCount === bloodlines && item.elementSlotCount === elements); if (prepared) setVariantId(prepared.id) }
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`${build.name} build details`}><button className="modal-backdrop" onClick={onClose} aria-label="Close details" /><article ref={panelRef} className="detail-panel">
    <div className="detail-hero"><Portrait src={build.image} alt={build.name} /><div className="detail-hero__shade" /><button ref={closeRef} className="icon-button detail-close" onClick={onClose} aria-label="Close details"><X /></button><div className="detail-hero__copy"><span className="eyebrow">{build.series} · {build.version}</span><h2>{build.name}</h2><p>{build.description}</p><div className="tag-row"><span className="tag">{variant.verificationStatus}</span><span className="tag">{build.confidence}</span><span className="tag">{variant.lastVerifiedUpdate}</span></div></div></div>
    <div className="detail-content">
      <section><Heading n="1" title="Recommended Setup" /><div className="variant-controls"><label>Bloodline slots<select value={variant.bloodlineSlotCount} onChange={(e) => choose(Number(e.target.value), variant.elementSlotCount)}>{bloodlineCounts.map((count) => <option key={count}>{count}</option>)}</select></label><label>Element slots<select value={variant.elementSlotCount} onChange={(e) => choose(variant.bloodlineSlotCount, Number(e.target.value))}>{elementCounts.map((count) => <option key={count}>{count}</option>)}</select></label><label>Prepared variant<select value={variant.id} onChange={(e) => setVariantId(e.target.value)}>{build.variants.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div><div className="overview-grid">{[['C-mode', variant.cMode], ['Z-mode', variant.zMode], ['Combat Art', variant.combatArt], ['Weapon', variant.weapon], ['Mentor', variant.mentor], ['Race', variant.race], ['Ninja tool', variant.ninjaTool], ['Consumable', variant.consumable]].map(([label, value]) => <div className="loadout-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="bloodline-detail-grid">{variant.bloodlines.map((slot) => <article key={slot.name}><h4>{slot.name}</h4><p>{slot.reason}</p><small>Represents: {slot.represents}</small><strong>{slot.exactMovesUsed.join(' · ') || 'No exact moves selected'}</strong><span>{slot.useMode ? 'Mode used' : 'Mode not used'} · Accessible replacement: {slot.replacements.accessible[0] ?? 'None verified'}</span></article>)}</div></section>
      <section><Heading n="2" title="Why This Build Fits" /><p>{build.description}</p><ul>{build.characterAbilities.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><Heading n="3" title="Exact Hotbar" /><button className="button button--outline" onClick={() => navigator.clipboard.writeText(variant.hotbar.map((slot) => `${slot.key} — ${slot.ability}`).join('\n'))}><Clipboard size={14} /> Copy official hotbar</button><div className="hotbar-grid">{variant.hotbar.map((slot) => <article className="hotbar-slot" key={slot.id}><div className="hotbar-key">{slot.key}</div><div><span>{slot.source}</span><h4>{slot.ability}</h4><p>{slot.purpose}</p><small>{slot.comboRole} · {slot.usageNotes}</small></div>{slot.blockBreak && <i title="Intended to open a guarding opponent">GUARD BREAK</i>}</article>)}</div></section>
      <section><Heading n="4" title="How to Use It" /><ul>{variant.usageGuide.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><Heading n="5" title="Combos" /><div className="combo-list">{variant.combos.map((combo) => <article key={combo.name}><b>{combo.sequence[0]}</b><div><h4>{combo.name}</h4><div className="key-sequence">{combo.sequence.map((key, index) => <kbd key={`${key}-${index}`}>{key}</kbd>)}</div><p>{combo.explanation}</p></div></article>)}</div></section>
      <section><Heading n="6" title="Modes and Controls" /><p><strong>C-mode:</strong> {variant.cMode}. <strong>Z-mode:</strong> {variant.zMode}.</p></section>
      <section><Heading n="7" title="Alternative Versions" /><div className="variant-list">{build.variants.map((item) => <button className={item.id === variant.id ? 'active' : ''} onClick={() => setVariantId(item.id)} key={item.id}>{item.name} · {item.bloodlineSlotCount} BL / {item.elementSlotCount} elements</button>)}</div></section>
      <section><Heading n="8" title="Replacements" /><div className="notes-columns">{variant.bloodlines.map((slot) => <div key={slot.name}><h4>{slot.name}</h4><p>Lore: {slot.replacements.lore.join(', ') || 'None verified'}</p><p>Competitive: {slot.replacements.competitive.join(', ') || 'None verified'}</p><p>Accessible: {slot.replacements.accessible.join(', ') || 'None verified'}</p></div>)}</div></section>
      <section><Heading n="9" title="Strengths and Weaknesses" /><div className="notes-columns"><div><h4>Strengths</h4><ul>{variant.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h4>Weaknesses</h4><ul>{variant.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h4>Ratings</h4>{Object.entries(variant.ratings).filter(([key]) => key !== 'difficulty').map(([key, value]) => <Score key={key} label={key} value={value} />)}</div></div></section>
      <section><Heading n="10" title="Verification" /><p><strong>{variant.verificationStatus}</strong> · {build.confidence} · Last checked for {variant.lastVerifiedUpdate}.</p><p>Known compromises: {build.knownCompromises.join(' ')}</p><ul>{build.evidence.map((item) => <li key={`${item.category}-${item.claim}`}><strong>{item.category}:</strong> {item.claim} — {item.notes}</li>)}</ul></section>
    </div>
  </article></div>
}
function Heading({ n, title }: { n: string; title: string }) { return <div className="section-heading"><div><span className="section-index">{n}</span><h3>{title}</h3></div></div> }
