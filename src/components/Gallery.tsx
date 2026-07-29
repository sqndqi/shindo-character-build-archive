import { SearchX } from 'lucide-react'
import type { CharacterBuild, SlotLimit } from '../types'
import { CharacterCard } from './CharacterCard'

type Props = {
  builds: CharacterBuild[]
  slotLimit: SlotLimit
  compareIds: string[]
  favorites: string[]
  onOpen: (build: CharacterBuild) => void
  onCompare: (id: string) => void
  onFavorite: (id: string) => void
  onClear: () => void
  mode: 'compact' | 'visual'
  performanceMode: boolean
}

export function Gallery({ builds, slotLimit, compareIds, favorites, onOpen, onCompare, onFavorite, onClear, mode, performanceMode }: Props) {
  if (!builds.length) {
    return (
      <div className="empty-state">
        <SearchX size={32} />
        <h3>No builds found</h3>
        <p>Clear your filters or try a broader search.</p>
        <button className="button button--outline" onClick={onClear}>Clear filters</button>
      </div>
    )
  }

  return (
    <div className={`gallery-grid gallery-grid--${mode} ${performanceMode ? 'gallery-grid--virtualized' : ''}`}>
      {builds.map((build) => (
        <CharacterCard
          key={build.id}
          build={build}
          slotLimit={slotLimit}
          selected={compareIds.includes(build.id)}
          favorite={favorites.includes(build.id)}
          comparisonDisabled={compareIds.length >= 3}
          onOpen={onOpen}
          onCompare={onCompare}
          onFavorite={onFavorite}
          mode={mode}
        />
      ))}
    </div>
  )
}
