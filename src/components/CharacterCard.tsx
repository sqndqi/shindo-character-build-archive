import { memo } from 'react'
import { ArrowUpRight, Check, Heart, Swords } from 'lucide-react'
import type { CharacterBuild, SlotLimit } from '../types'
import { Portrait } from './Portrait'
import { Score } from './Score'

type Props = {
  build: CharacterBuild
  slotLimit: SlotLimit
  selected: boolean
  favorite: boolean
  comparisonDisabled: boolean
  onOpen: (build: CharacterBuild) => void
  onCompare: (id: string) => void
  onFavorite: (id: string) => void
  mode: 'compact' | 'visual'
}

export const CharacterCard = memo(function CharacterCard({ build, slotLimit, selected, favorite, comparisonDisabled, onOpen, onCompare, onFavorite, mode }: Props) {
  const activeBloodlines = build.slotAlternatives[slotLimit === 2 ? 'twoSlots' : slotLimit === 3 ? 'threeSlots' : 'fourSlots']

  return (
    <article className={`character-card character-card--${mode}`}>
      <div className="character-card__visual">
        <Portrait src={build.image} alt={build.name} thumbnail />
        <div className="character-card__scrim" />
        <div className="character-card__serial">BUILD / {build.id.slice(0, 3).toUpperCase()}</div>
        <button
          className={`compare-toggle ${selected ? 'is-selected' : ''}`}
          onClick={() => onCompare(build.id)}
          disabled={comparisonDisabled && !selected}
          title={selected ? 'Remove from comparison' : 'Add to comparison'}
          aria-label={`${selected ? 'Remove' : 'Add'} ${build.name} ${selected ? 'from' : 'to'} comparison`}
        >
          {selected ? <Check size={15} /> : <Swords size={15} />}
        </button>
        <button
          className={`favorite-toggle ${favorite ? 'is-favorite' : ''}`}
          onClick={() => onFavorite(build.id)}
          aria-label={`${favorite ? 'Remove' : 'Add'} ${build.name} ${favorite ? 'from' : 'to'} favorites`}
        >
          <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <div className="character-card__identity">
          <span>{build.series}</span>
          <h3>{build.name}</h3>
          <p>{build.version}</p>
        </div>
      </div>
      <div className="character-card__body">
        <div className="tag-row">
          {build.archetype.slice(0, 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
        <div className="card-build-line">
          <span>MAIN BLOODLINE</span>
          <strong>{activeBloodlines[0] ?? 'Unassigned'}</strong>
        </div>
        <div className="card-build-line">
          <span>MAIN MODE</span>
          <strong>{build.cMode}</strong>
        </div>
        <div className="bloodline-chips">{activeBloodlines.map((bloodline) => <span key={bloodline}>{bloodline}</span>)}</div>
        <div className="card-scores">
          <Score compact label="ACCURACY" value={build.ratings.accuracy} />
          <Score compact label="PVP" value={build.ratings.pvp} />
          <Score compact label="AURA" value={build.ratings.aura} />
        </div>
        <div className="card-footer">
          <span className="difficulty">AURA {build.ratings.aura.toFixed(1)} · {build.effectsIntensity.toUpperCase()} FX</span>
          <button className="button button--text" onClick={() => onOpen(build)} aria-label={`Quick view ${build.name}`}>Quick view <ArrowUpRight size={15} /></button>
        </div>
      </div>
    </article>
  )
})
