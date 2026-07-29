import { useMemo, useState } from 'react'
import { Search, Trophy } from 'lucide-react'
import type { CharacterBuild, TierRank } from '../types'
import { Portrait } from './Portrait'

const tiers: TierRank[] = ['S+', 'S', 'A', 'B', 'C']

type Props = {
  builds: CharacterBuild[]
  assignments: Record<string, TierRank>
  onAssign: (id: string, tier: TierRank) => void
  onOpen: (build: CharacterBuild) => void
}

export function TierListBoard({ builds, assignments, onAssign, onOpen }: Props) {
  const [search, setSearch] = useState('')
  const visible = useMemo(() => builds.filter((build) => `${build.name} ${build.series}`.toLowerCase().includes(search.toLowerCase())), [builds, search])
  const unranked = visible.filter((build) => !assignments[build.id])

  const chip = (build: CharacterBuild) => (
    <article className="tier-chip" key={build.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', build.id)}>
      <button className="tier-chip__portrait" onClick={() => onOpen(build)}><Portrait src={build.image} alt={build.name} /></button>
      <div><strong>{build.name}</strong><span>{build.series}</span></div>
      <select aria-label={`Tier for ${build.name}`} value={assignments[build.id] ?? ''} onChange={(event) => onAssign(build.id, event.target.value as TierRank)}>
        <option value="" disabled>Tier</option>
        {tiers.map((tier) => <option key={tier}>{tier}</option>)}
      </select>
    </article>
  )

  return (
    <div className="tier-lab">
      <section className="tier-hero">
        <div><span className="eyebrow"><Trophy size={14} /> LOCAL TIER WORKSHOP</span><h1>Build your own<br /><i>combat hierarchy.</i></h1></div>
        <p>Drag fighters into a tier or use each card’s selector. Rankings are saved in this browser.</p>
      </section>
      <div className="tier-search"><Search size={16} /><input aria-label="Search tier list characters" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the 90-fighter roster…" /></div>
      <div className="tier-board">
        {tiers.map((tier) => (
          <section
            className={`tier-row tier-row--${tier.replace('+', 'plus').toLowerCase()}`}
            key={tier}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const id = event.dataTransfer.getData('text/plain')
              if (id) onAssign(id, tier)
            }}
          >
            <div className="tier-rank">{tier}</div>
            <div className="tier-members">{visible.filter((build) => assignments[build.id] === tier).map(chip)}</div>
          </section>
        ))}
      </div>
      <section className="unranked-pool">
        <div><span>UNRANKED POOL</span><strong>{unranked.length}</strong></div>
        <div>{unranked.map(chip)}</div>
      </section>
    </div>
  )
}
