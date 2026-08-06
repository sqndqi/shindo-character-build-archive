import type { SlotResearchStatus } from '../../types'

const labels: Record<SlotResearchStatus, string> = {
  'verified': 'Verified',
  'owner-confirmed': 'Owner confirmed',
  'needs-retesting': 'Needs retesting',
  'unresolved': 'Unresolved',
  'intentionally-unused': 'Intentionally unused',
  'alternative-for-viability': 'Alt: viability',
  'alternative-for-accuracy': 'Alt: accuracy',
}

const severity: Record<SlotResearchStatus, string> = {
  'verified': 'verified',
  'owner-confirmed': 'confirmed',
  'needs-retesting': 'warning',
  'unresolved': 'danger',
  'intentionally-unused': 'muted',
  'alternative-for-viability': 'info',
  'alternative-for-accuracy': 'info',
}

export function ResearchStatusBadge({ status }: { status?: SlotResearchStatus }) {
  if (!status) return <span className="research-badge research-badge--unknown">Not researched</span>
  return <span className={`research-badge research-badge--${severity[status]}`}>{labels[status]}</span>
}
