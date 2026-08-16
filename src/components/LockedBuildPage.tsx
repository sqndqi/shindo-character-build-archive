import { ArrowLeft, Check, LockKeyhole, ShoppingCart } from 'lucide-react'
import type { ArchiveBuildRecord } from '../types/archiveAccess'
import { Portrait } from './Portrait'

/**
 * Loadout categories every Shindo build is composed of. These are structural
 * category names only — never values, counts, or anything derived from the
 * locked record, which the repository strips before it reaches the client.
 */
const LOCKED_CATEGORIES = [
  'Bloodlines',
  'Elements',
  'Mode',
  'Combat Art',
  'Weapon',
  'Move set',
] as const

export function LockedBuildPage({
  build,
  onBack,
  onUnlock,
  isSelected,
  onToggleSelect,
}: {
  build: ArchiveBuildRecord
  onBack: () => void
  onUnlock: () => void
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}) {
  const handleToggle = () => onToggleSelect?.(build.id)

  return (
    <main className="full-build-page locked-build-page">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft /> Back to archive
      </button>
      <section className="locked-build-hero">
        <div className="locked-build-hero__portrait">
          <Portrait src={build.image} alt={build.name} />
          <div className="chakra-chain chakra-chain--one" />
          <div className="chakra-chain chakra-chain--two" />
        </div>
        <div>
          <span>{build.series} · {build.version}</span>
          <h1>{build.name}</h1>
          <p>{build.description}</p>
          <div className="locked-build-meta">
            <strong>{build.archetype.slice(0, 3).join(' · ')}</strong>
            <span>{build.publicVariantCount} prepared variants</span>
          </div>
          <p className="locked-manifest-heading" aria-hidden="true">Premium loadout — locked</p>
          <div className="locked-loadout-slots" role="list" aria-label="Premium loadout hidden">
            {LOCKED_CATEGORIES.map((label) => (
              <div key={label} role="listitem">
                <LockKeyhole aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="locked-build-actions">
            {onToggleSelect && (
              <button
                className={`button ${isSelected ? 'button--selected' : 'button--primary'}`}
                onClick={handleToggle}
                aria-pressed={isSelected}
              >
                {isSelected
                  ? <><Check size={15} aria-hidden="true" /> Selected for unlock</>
                  : <><LockKeyhole size={15} aria-hidden="true" /> Select this character</>}
              </button>
            )}
            <button className="button button--outline" onClick={onUnlock}>
              <ShoppingCart size={15} aria-hidden="true" /> View selection
            </button>
          </div>
          <small>Exact Bloodlines, moves, equipment, ratings, and reasoning are not sent for locked characters.</small>
        </div>
      </section>
    </main>
  )
}
