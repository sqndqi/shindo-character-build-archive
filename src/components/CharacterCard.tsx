import { memo } from 'react'
import { ArrowUpRight, Check, Heart, Swords } from 'lucide-react'
import type { CharacterBuild, SlotLimit } from '../types'
import { Portrait } from './Portrait'
import { Score } from './Score'

type Props = { build: CharacterBuild; slotLimit: SlotLimit; selected: boolean; favorite: boolean; comparisonDisabled: boolean; onOpen: (build: CharacterBuild) => void; onCompare: (id: string) => void; onFavorite: (id: string) => void; mode: 'compact' | 'visual' }

export const CharacterCard = memo(function CharacterCard({ build, slotLimit, selected, favorite, comparisonDisabled, onOpen, onCompare, onFavorite, mode }: Props) {
  const variant = build.variants.find((item) => item.bloodlineSlotCount === slotLimit) ?? build.variants[0]
  return <article className={`character-card character-card--${mode}`}>
    <div className="character-card__visual"><Portrait src={build.thumbnail || build.image} alt={build.name} thumbnail /><div className="character-card__scrim" /><div className="character-card__serial">{build.publicationStatus.toUpperCase()} · {variant.lastVerifiedUpdate}</div>
      <button className={`compare-toggle ${selected ? 'is-selected' : ''}`} onClick={() => onCompare(build.id)} disabled={comparisonDisabled && !selected} aria-label={`${selected ? 'Remove' : 'Add'} ${build.name} ${selected ? 'from' : 'to'} comparison`}>{selected ? <Check size={15} /> : <Swords size={15} />}</button>
      <button className={`favorite-toggle ${favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(build.id)} aria-label={`${favorite ? 'Remove' : 'Add'} ${build.name} ${favorite ? 'from' : 'to'} favorites`}><Heart size={15} fill={favorite ? 'currentColor' : 'none'} /></button>
      <div className="character-card__identity"><span>{build.series}{build.media === 'Manga / Anime' ? ' · MANGA / ANIME' : ''}</span><h3 title={build.name}>{build.name}</h3><p>{build.version}</p></div>
    </div>
    <div className="character-card__body"><div className="card-build-line"><span>ACTIVE BLOODLINES</span><strong>{variant.bloodlines.map((slot) => slot.name).join(' · ')}</strong></div><div className="card-build-line"><span>ELEMENTS</span><strong>{variant.elements.map((slot) => slot.name).join(' / ')}</strong></div><div className="card-build-line"><span>MAIN MODE</span><strong>{variant.cMode}</strong></div><div className="card-build-line"><span>COMBAT ART</span><strong>{variant.combatArt}</strong></div>
      <div className="card-scores"><Score compact label="ACCURACY" value={variant.ratings.accuracy} /><Score compact label="PVP" value={variant.ratings.pvp} /><Score compact label="AURA" value={variant.ratings.aura} /></div>
      <div className="card-footer"><span className="difficulty">{variant.bloodlineSlotCount} BL / {variant.elementSlotCount} ELEMENT SLOTS</span><button className="button button--text" onClick={() => onOpen(build)}>View build <ArrowUpRight size={15} /></button></div>
    </div>
  </article>
})
