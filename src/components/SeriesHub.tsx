import { Swords } from 'lucide-react'
import type { CharacterBuild } from '../types'
import { ShindoIcon } from './ShindoIcon'
import type { ArchiveBuildRecord } from '../types/archiveAccess'

export default function SeriesHub({ builds, series, onOpen }: { builds: CharacterBuild[]; series: string; onOpen: (build: CharacterBuild) => void }) {
  const roster = builds.filter((build) => build.series === series || build.franchise === series)
  const weaponUsers = roster.filter((build) => {
    const variant = build.variants.find((item) => item.type === 'Primary') ?? build.variants[0]
    return variant && (variant.weapon !== 'None' || (variant.kenjutsu && variant.kenjutsu !== 'None'))
  })
  return <main className="series-hub">
    <header className="series-hub__hero"><span>Series dossier</span><h1>{series}</h1><p>{roster.length} archive characters · {roster.filter((build) => build.publicationStatus === 'Reviewed').length} reviewed · {weaponUsers.length} weapon users</p></header>
    <section className="series-hub__roster"><header><Swords /><div><span>Character roster</span><h2>Builds from {series}</h2></div></header><div>{roster.map((build) => {
      const variant = build.variants.find((item) => item.type === 'Primary') ?? build.variants[0]
      const locked = ['Locked', 'Selected'].includes((build as ArchiveBuildRecord).accessState)
      return <button key={build.id} onClick={() => onOpen(build)}><img src={build.thumbnail ?? build.image} alt="" width="96" height="68" loading="lazy" decoding="async" /><div><strong>{build.name}</strong><span>{build.version}</span><small>{locked ? 'Premium build locked' : build.publicationStatus}</small></div>{locked ? <span aria-label="Locked loadout">?</span> : <ShindoIcon name={variant?.bloodlines[0]?.name ?? ''} type="Bloodline" />}</button>
    })}</div></section>
  </main>
}
