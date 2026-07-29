import { memo } from 'react'
import { ArrowUpRight, Check, Heart, Swords } from 'lucide-react'
import type { CharacterBuild, SlotLimit } from '../types'
import { Portrait } from './Portrait'
import { ShindoIcon } from './ShindoIcon'
import { preparedVariantLabels, variantKenjutsu } from '../lib/variants'

type Props = { build: CharacterBuild; slotLimit: SlotLimit; selected: boolean; favorite: boolean; comparisonDisabled: boolean; onOpen: (build: CharacterBuild) => void; onCompare: (id: string) => void; onFavorite: (id: string) => void; mode: 'compact' | 'visual' }

export const CharacterCard = memo(function CharacterCard({ build, slotLimit, selected, favorite, comparisonDisabled, onOpen, onCompare, onFavorite, mode }: Props) {
  const variant = build.variants.find((item) => item.bloodlineSlotCount === slotLimit) ?? build.variants[0]
  const prepared = preparedVariantLabels(build.variants)
  return <article className={`character-card character-card--${mode}`}>
    <div className="character-card__visual"><Portrait src={build.thumbnail || build.image} alt={build.name} thumbnail /><div className="character-card__scrim" /><span className={`status-badge status-badge--${build.publicationStatus.toLowerCase().replace(' ', '-')}`}>{build.publicationStatus}</span>
      <button className={`compare-toggle ${selected ? 'is-selected' : ''}`} onClick={() => onCompare(build.id)} disabled={comparisonDisabled && !selected} aria-label={`${selected ? 'Remove' : 'Add'} ${build.name} ${selected ? 'from' : 'to'} comparison`}>{selected ? <Check size={15} /> : <Swords size={15} />}</button>
      <button className={`favorite-toggle ${favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(build.id)} aria-label={`${favorite ? 'Remove' : 'Add'} ${build.name} ${favorite ? 'from' : 'to'} favorites`}><Heart size={15} fill={favorite ? 'currentColor' : 'none'} /></button>
      <div className="character-card__identity"><span>{build.series}{build.media === 'Manga / Anime' ? ' · Manga / Anime' : ''}</span><h3 title={build.name}>{build.name}</h3><p>{build.version}</p></div>
    </div>
    <div className="character-card__body">
      <div className="card-primary-bloodline"><ShindoIcon name={variant.bloodlines[0]?.name ?? 'Unresolved'} type="Bloodline" size="large" eager /><div><span>Main Bloodline</span><strong>{variant.bloodlines[0]?.name ?? 'Unresolved'}</strong></div></div>
      <div className="card-icon-row" aria-label="Supporting Bloodlines">{variant.bloodlines.slice(1).map((slot) => <ShindoIcon key={slot.name} name={slot.name} type="Bloodline" size="small" />)}</div>
      <div className="card-build-line"><span>Elements</span><strong className="inline-assets">{variant.elements.map((slot) => <ShindoIcon key={slot.name} name={slot.name} type="Element" size="small" showLabel />)}</strong></div>
      <div className="card-build-line"><span>Main mode</span><strong>{variant.cMode}</strong></div>
      <div className="card-build-line"><span>Combat Art</span><strong>{variant.combatArt}</strong></div>
      {variantKenjutsu(variant) !== 'None' && <div className="card-build-line"><span>Kenjutsu</span><strong>{variantKenjutsu(variant)}</strong></div>}
      {variant.weapon !== 'None' && <div className="card-build-line"><span>Weapon</span><strong>{variant.weapon}</strong></div>}
      <div className="card-scores" aria-label="Build ratings"><span><b>{variant.ratings.accuracy.toFixed(1)}</b>Accuracy</span><span><b>{variant.ratings.pvp.toFixed(1)}</b>PvP</span><span><b>{variant.ratings.aura.toFixed(1)}</b>Aura</span></div>
      <div className="card-footer"><span className="difficulty">{build.publicationStatus === 'Reviewed' ? `${prepared.two ? '2' : '—'} / ${prepared.three ? '3' : '—'} / ${prepared.four ? '4' : '—'} slot${prepared.accessible ? ' · Accessible' : ''}` : `${variant.bloodlineSlotCount} Bloodlines · alternatives researching`}</span><button className="button button--text" onClick={() => onOpen(build)}>Quick view <ArrowUpRight size={15} /></button></div>
    </div>
  </article>
})
