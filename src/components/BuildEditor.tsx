import { useEffect, useState } from 'react'
import { Save, X } from 'lucide-react'
import type { CharacterBuild } from '../types'

type Props = {
  build: CharacterBuild
  title?: string
  onSave: (build: CharacterBuild) => void
  onClose: () => void
}

export function BuildEditor({ build, title = 'Edit build', onSave, onClose }: Props) {
  const [draft, setDraft] = useState<CharacterBuild>(() => structuredClone(build))
  useEffect(() => setDraft(structuredClone(build)), [build])

  const set = <K extends keyof CharacterBuild>(key: K, value: CharacterBuild[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const split = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean)

  return (
    <div className="modal-layer editor-layer" role="dialog" aria-modal="true" aria-label={title}>
      <button className="modal-backdrop" onClick={onClose} aria-label="Close editor" />
      <form className="editor-panel" onSubmit={(event) => { event.preventDefault(); onSave(draft) }}>
        <header>
          <div><span className="eyebrow">LOCAL ARCHIVE EDITOR</span><h2>{title}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close editor"><X /></button>
        </header>

        <div className="editor-scroll">
          <section>
            <h3>Character identity</h3>
            <div className="form-grid">
              <label>Name<input value={draft.name} required onChange={(e) => set('name', e.target.value)} /></label>
              <label>Series<input value={draft.series} required onChange={(e) => set('series', e.target.value)} /></label>
              <label>Franchise<input value={draft.franchise} required onChange={(e) => set('franchise', e.target.value)} /></label>
              <label>Version / arc<input value={draft.version} onChange={(e) => set('version', e.target.value)} /></label>
              <label>Image path<input value={draft.image} onChange={(e) => set('image', e.target.value)} placeholder="/characters/name.jpg" /></label>
              <label className="span-2">Build types, comma separated<input value={draft.archetype.join(', ')} onChange={(e) => set('archetype', split(e.target.value))} /></label>
              <label className="span-2">Custom tags, comma separated<input value={draft.customTags.join(', ')} onChange={(e) => set('customTags', split(e.target.value))} /></label>
              <label className="span-2">Fighting style description<textarea value={draft.description} onChange={(e) => set('description', e.target.value)} /></label>
            </div>
          </section>

          <section>
            <h3>Loadout</h3>
            <div className="bloodline-editor">
              {draft.bloodlines.map((bloodline, index) => (
                <div key={index}>
                  <b>0{index + 1}</b>
                  <input aria-label={`Bloodline ${index + 1}`} value={bloodline.name} onChange={(e) => set('bloodlines', draft.bloodlines.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} />
                  <input aria-label={`Bloodline ${index + 1} purpose`} value={bloodline.purpose} onChange={(e) => set('bloodlines', draft.bloodlines.map((item, i) => i === index ? { ...item, purpose: e.target.value } : item))} />
                  <label className="mode-check"><input type="checkbox" checked={bloodline.useMode} onChange={(e) => set('bloodlines', draft.bloodlines.map((item, i) => i === index ? { ...item, useMode: e.target.checked } : item))} /> Use mode</label>
                </div>
              ))}
            </div>
            <div className="form-grid">
              <label>Elements, comma separated<input value={draft.elements.join(', ')} onChange={(e) => set('elements', split(e.target.value).slice(0, 2))} /></label>
              <label>C-Mode<input value={draft.cMode} onChange={(e) => set('cMode', e.target.value)} /></label>
              <label>Z-Mode<input value={draft.zMode} onChange={(e) => set('zMode', e.target.value)} /></label>
              <label>Combat Art<input value={draft.combatArt} onChange={(e) => set('combatArt', e.target.value)} /></label>
              <label>Weapon<input value={draft.weapon} onChange={(e) => set('weapon', e.target.value)} /></label>
              <label>Ninja Tool<input value={draft.ninjaTool} onChange={(e) => set('ninjaTool', e.target.value)} /></label>
              <label>Consumable<input value={draft.consumable} onChange={(e) => set('consumable', e.target.value)} /></label>
              <label>Mentor<input value={draft.mentor} onChange={(e) => set('mentor', e.target.value)} /></label>
              <label>Race<input value={draft.race} onChange={(e) => set('race', e.target.value)} /></label>
              <label>Status<select value={draft.status} onChange={(e) => set('status', e.target.value as CharacterBuild['status'])}><option>Complete</option><option>Draft</option><option>Needs Testing</option></select></label>
              <label>Effects intensity<select value={draft.effectsIntensity} onChange={(e) => set('effectsIntensity', e.target.value as CharacterBuild['effectsIntensity'])}><option>Low</option><option>Medium</option><option>High</option><option>Ridiculous</option></select></label>
              <label>Aura rating<input type="number" min="0" max="10" step="0.1" value={draft.ratings.aura} onChange={(e) => set('ratings', { ...draft.ratings, aura: Number(e.target.value) })} /></label>
            </div>
          </section>

          <section>
            <h3>Exact hotbar</h3>
            <div className="hotbar-editor">
              {draft.hotbar.map((slot, index) => (
                <div key={`${slot.key}-${index}`}>
                  <kbd>{slot.key}</kbd>
                  <input aria-label={`${slot.key} ability`} value={slot.ability} onChange={(e) => set('hotbar', draft.hotbar.map((item, i) => i === index ? { ...item, ability: e.target.value } : item))} />
                  <input aria-label={`${slot.key} source`} value={slot.source} onChange={(e) => set('hotbar', draft.hotbar.map((item, i) => i === index ? { ...item, source: e.target.value } : item))} />
                  <input aria-label={`${slot.key} purpose`} value={slot.purpose} onChange={(e) => set('hotbar', draft.hotbar.map((item, i) => i === index ? { ...item, purpose: e.target.value } : item))} />
                  <label className="mode-check"><input type="checkbox" checked={slot.blockBreak} onChange={(e) => set('hotbar', draft.hotbar.map((item, i) => i === index ? { ...item, blockBreak: e.target.checked } : item))} /> Break</label>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Archivist notes</h3>
            <label>Notes<textarea value={draft.notes} onChange={(e) => set('notes', e.target.value)} /></label>
          </section>
        </div>
        <footer>
          <span>Changes are stored only in this browser.</span>
          <div><button type="button" className="button button--outline" onClick={onClose}>Cancel</button><button className="button button--primary" type="submit"><Save size={15} /> Save build</button></div>
        </footer>
      </form>
    </div>
  )
}
