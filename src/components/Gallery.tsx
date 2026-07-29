import { SearchX } from 'lucide-react'
import type { CharacterBuild, SlotLimit } from '../types'
import { CharacterCard } from './CharacterCard'

type Props = {
  builds: CharacterBuild[]
  slotLimit: SlotLimit
  compareIds: string[]
  onOpen: (build: CharacterBuild) => void
  onCompare: (id: string) => void
  onClear: () => void
}

export function Gallery({ builds, slotLimit, compareIds, onOpen, onCompare, onClear }: Props) {
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
    <div className="gallery-grid">
      {builds.map((build) => (
        <CharacterCard
          key={build.id}
          build={build}
          slotLimit={slotLimit}
          selected={compareIds.includes(build.id)}
          comparisonDisabled={compareIds.length >= 3}
          onOpen={() => onOpen(build)}
          onCompare={() => onCompare(build.id)}
        />
      ))}
    </div>
  )
}
