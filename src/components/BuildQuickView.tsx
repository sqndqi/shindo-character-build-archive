import { useEffect, useRef } from 'react'
import { ArrowRight, X } from 'lucide-react'
import type { CharacterBuild } from '../types'
import { Portrait } from './Portrait'
import { ShindoIcon } from './ShindoIcon'
import { variantKenjutsu } from '../lib/variants'

export function BuildQuickView({ build, onClose, onOpenFull }: {
  build: CharacterBuild
  onClose: () => void
  onOpenFull: () => void
}) {
  const panel = useRef<HTMLElement>(null)
  const variant = build.variants.find((item) => item.type === 'Primary') ?? build.variants[0]
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const close = panel.current?.querySelector<HTMLButtonElement>('.quick-view__close')
    close?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const controls = [...(panel.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])]
      if (!controls.length) return
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    addEventListener('keydown', onKey)
    return () => { removeEventListener('keydown', onKey); previous?.focus() }
  }, [onClose])

  return <div className="quick-view-layer" role="dialog" aria-modal="true" aria-label={`${build.name} quick view`}>
    <button className="quick-view__backdrop" onClick={onClose} aria-label="Close quick view" />
    <article className="quick-view" ref={panel}>
      <button className="icon-button quick-view__close" onClick={onClose} aria-label="Close quick view"><X /></button>
      <div className="quick-view__portrait"><Portrait src={build.thumbnail || build.image} alt={build.name} thumbnail /></div>
      <div className="quick-view__content">
        <span className={`status-badge status-badge--${build.publicationStatus.toLowerCase().replaceAll(' ', '-')}`}>{build.publicationStatus}</span>
        <p className="eyebrow">{build.series}</p>
        <h2>{build.name}</h2>
        <p className="quick-view__version">{build.version}</p>
        <div className="quick-view__icons" aria-label="Bloodlines">
          {variant.bloodlines.map((slot) => <span key={slot.name}><ShindoIcon name={slot.name} type="Bloodline" size="medium" /><b>{slot.name}</b></span>)}
        </div>
        <dl className="quick-view__facts">
          <div><dt>Elements</dt><dd>{variant.elements.map((item) => item.name).join(' · ')}</dd></div>
          <div><dt>C-mode</dt><dd>{variant.cMode}</dd></div>
          <div><dt>Combat Art</dt><dd>{variant.combatArt}</dd></div>
          {variantKenjutsu(variant) !== 'None' && <div><dt>Kenjutsu</dt><dd>{variantKenjutsu(variant)}</dd></div>}
          {variant.weapon !== 'None' && <div><dt>Weapon</dt><dd>{variant.weapon}</dd></div>}
        </dl>
        <div className="quick-view__ratings">
          <span><b>{variant.ratings.accuracy.toFixed(1)}</b> Accuracy</span>
          <span><b>{variant.ratings.pvp.toFixed(1)}</b> PvP</span>
        </div>
        <button className="button button--primary quick-view__open" onClick={onOpenFull}>Open full build <ArrowRight size={16} /></button>
      </div>
    </article>
  </div>
}
