import { memo, useState } from 'react'
import { Expand, Minimize2 } from 'lucide-react'
import type { HotbarSlot } from '../types'
import { current249OwnerReference } from '../data/hotbarLayout'
import { ShindoIcon } from './ShindoIcon'

export const GameHotbarPreview = memo(function GameHotbarPreview({
  hotbar,
  selectedMoveId,
  onSelect,
}: {
  hotbar: HotbarSlot[]
  selectedMoveId: string | null
  onSelect: (moveId: string | null) => void
}) {
  const [enlarged, setEnlarged] = useState(false)
  return <section className={`game-hotbar ${enlarged ? 'is-enlarged' : ''}`} aria-label="Owner-reference game hotbar">
    <header>
      <div><span>Game view</span><strong>Update 249 owner HUD reference</strong></div>
      <button className="button button--text" onClick={() => setEnlarged((value) => !value)}>{enlarged ? <Minimize2 size={15} /> : <Expand size={15} />}{enlarged ? 'Fit to page' : 'Tap to enlarge'}</button>
    </header>
    <div className="game-hotbar__scroller">
      <div className="game-hotbar__stage">
        <picture><source srcSet="/shindo-ui/hotbar-frame.webp" type="image/webp" /><img src="/shindo-ui/hotbar-frame.png" alt="" width="754" height="139" decoding="async" /></picture>
        {current249OwnerReference.anchors.map((anchor) => {
          const slot = anchor.sourceKey ? hotbar.find((item) => item.key === anchor.sourceKey) : undefined
          const empty = !slot?.canonicalMoveId
          const title = slot
            ? `${anchor.displayedKey}: ${slot.ability}. ${slot.source}. ${slot.comboRole}. ${anchor.mappingStatus}.`
            : `${anchor.displayedKey}: ${anchor.sourceKey ? 'No equipped move' : 'No canonical archive mapping'}. ${anchor.mappingStatus}.`
          return <button
            type="button"
            key={anchor.id}
            className={`game-hotbar__anchor is-${anchor.category.toLowerCase().replaceAll(' ', '-')} ${empty ? 'is-empty' : ''} ${selectedMoveId && selectedMoveId === slot?.canonicalMoveId ? 'is-selected' : ''}`}
            style={{ left: `${anchor.xPercent}%`, top: `${anchor.yPercent}%`, width: `${anchor.widthPercent}%`, height: `${anchor.heightPercent}%` }}
            title={title}
            aria-label={title}
            onClick={() => onSelect(slot?.canonicalMoveId ?? null)}
          >
            {!empty && <ShindoIcon name={slot.source} size="large" />}
            <kbd>{anchor.displayedKey}</kbd>
            {anchor.mappingStatus !== 'Confirmed visual position' && <i aria-hidden="true">?</i>}
          </button>
        })}
        {import.meta.env.DEV && <div className="game-hotbar__calibration" aria-hidden="true">{current249OwnerReference.anchors.map((anchor) => <span key={anchor.id} style={{ left: `${anchor.xPercent}%`, top: `${anchor.yPercent}%`, width: `${anchor.widthPercent}%`, height: `${anchor.heightPercent}%` }}>{anchor.id}<small>{anchor.xPercent.toFixed(1)} / {anchor.yPercent.toFixed(1)}</small></span>)}</div>}
      </div>
    </div>
    <p className="game-hotbar__notice">The frame confirms visual position. F, RMB+G, G, and E mapping requires owner confirmation and does not change the technical legality model.</p>
    <div className="game-hotbar__accessible-list">{current249OwnerReference.anchors.map((anchor) => {
      const slot = anchor.sourceKey ? hotbar.find((item) => item.key === anchor.sourceKey) : undefined
      return <span key={anchor.id}><kbd>{anchor.displayedKey}</kbd><b>{slot?.ability ?? 'Unmapped / unused'}</b><small>{slot?.source ?? anchor.mappingStatus}</small></span>
    })}</div>
  </section>
})
