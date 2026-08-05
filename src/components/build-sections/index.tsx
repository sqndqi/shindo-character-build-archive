import { useMemo, useState } from 'react'
import { AlertTriangle, ChevronDown, Clipboard, PackageCheck, Shield } from 'lucide-react'
import type { BuildVariant, CharacterBuild, HotbarSlot } from '../../types'
import type { CollectionState } from '../../hooks/useBloodlineCollection'
import type { BuildQualityIssue } from '../../lib/buildQuality'
import { auditVariant } from '../../lib/buildQuality'
import { variantEquipment, variantKenjutsu, inventoryMatch, closestPreparedVariant } from '../../lib/variants'
import type { HotbarKey } from '../../types/shindoGame'
import { GameHotbarPreview } from '../GameHotbarPreview'
import { ShindoIcon } from '../ShindoIcon'
import { ResearchStatusBadge } from './ResearchStatusBadge'
import { EmptyResearchState } from './EmptyResearchState'

export { ResearchStatusBadge, EmptyResearchState }

const isNone = (value: string) => /^(none|no z-mode|not used|unresolved)/i.test(value.trim())

export function SectionHeading({ id, eyebrow, title, subtitle }: { id: string; eyebrow: string; title: string; subtitle?: string }) {
  return (
    <header className="build-section__heading" id={id}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}

export function BuildOverviewSection({ build, variant, legalityStatus }: {
  build: CharacterBuild
  variant: BuildVariant
  legalityStatus: string
}) {
  return (
    <section className="build-section" id="section-overview">
      <SectionHeading id="h-overview" eyebrow="Section 1" title="Build overview" subtitle="Character identity, research status, and current variant context." />
      <div className="overview-facts-grid">
        <div className="overview-fact">
          <span>Character</span>
          <strong>{build.name}</strong>
        </div>
        <div className="overview-fact">
          <span>Series</span>
          <strong>{build.series}</strong>
        </div>
        <div className="overview-fact">
          <span>Version / Update</span>
          <strong>{variant.researchedGameVersion ?? build.version}</strong>
        </div>
        <div className="overview-fact">
          <span>Selected variant</span>
          <strong>{variant.name}</strong>
        </div>
        <div className="overview-fact">
          <span>Publication</span>
          <strong>{build.publicationStatus}</strong>
        </div>
        <div className="overview-fact">
          <span>Confidence</span>
          <strong>{build.confidence}</strong>
        </div>
        <div className="overview-fact">
          <span>Last verified</span>
          <strong>{variant.lastVerifiedUpdate}</strong>
        </div>
        <div className="overview-fact">
          <span>Hotbar legality</span>
          <strong>{legalityStatus}</strong>
        </div>
      </div>
      <div className="overview-scores-row">
        <div className="overview-score">
          <span>Character accuracy</span>
          <b>{variant.ratings.accuracy.toFixed(1)}</b>
          <small>/ 10</small>
        </div>
        <div className="overview-score">
          <span>PvP viability</span>
          <b>{variant.ratings.pvp.toFixed(1)}</b>
          <small>/ 10</small>
        </div>
        <div className="overview-score">
          <span>Visuals</span>
          <b>{variant.ratings.visuals.toFixed(1)}</b>
          <small>/ 10</small>
        </div>
        <div className="overview-score">
          <span>Difficulty</span>
          <b>{variant.ratings.difficulty.toFixed(1)}</b>
          <small>/ 10</small>
        </div>
        {variant.visualResemblance != null && (
          <div className="overview-score">
            <span>Visual resemblance</span>
            <b>{variant.visualResemblance.toFixed(1)}</b>
            <small>/ 10</small>
          </div>
        )}
      </div>
    </section>
  )
}

export function VariantSelectorSection({ build, variant, collection, onSelect }: {
  build: CharacterBuild
  variant: BuildVariant
  collection: CollectionState
  onSelect: (id: string) => void
}) {
  const slotGroups = useMemo(() => {
    const groups: Record<string, BuildVariant[]> = {}
    for (const v of build.variants) {
      const key = `${v.bloodlineSlotCount}-slot`
      ;(groups[key] ??= []).push(v)
    }
    return groups
  }, [build.variants])

  return (
    <section className="build-section" id="section-variants">
      <SectionHeading id="h-variants" eyebrow="Section 2" title="Slot variant selector" subtitle="Choose a prepared profile. Each variant is a complete, independent build." />
      {Object.entries(slotGroups).map(([label, variants]) => (
        <div key={label} className="variant-slot-group">
          <h3>{label.replace('-', ' ')}</h3>
          <div className="variant-card-grid">
            {variants.map((v) => {
              const match = inventoryMatch(v, collection)
              return (
                <button key={v.id} className={v.id === variant.id ? 'is-active' : ''} onClick={() => onSelect(v.id)}>
                  <span>{v.type}</span>
                  <strong>{v.name}</strong>
                  <small>{v.bloodlineSlotCount} BL / {v.elementSlotCount} EL</small>
                  <small>{v.hotbarLegalityStatus ?? 'Research pending'} · {match.missing.length ? `${match.missing.length} missing` : 'Ready'}</small>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}

export function BloodlineElementsSection({ variant }: { variant: BuildVariant }) {
  return (
    <section className="build-section" id="section-bloodlines">
      <SectionHeading id="h-bloodlines" eyebrow="Section 3" title="Elements and Bloodlines" subtitle="Equipped sources, selected moves, tactical role, and alternatives." />
      <h3>Bloodlines ({variant.bloodlineSlotCount} slots)</h3>
      <div className="ability-slot-grid">
        {variant.bloodlines.map((bl) => (
          <article key={bl.name} className="ability-slot">
            <div className="ability-slot__heading">
              <ShindoIcon name={bl.name} type="Bloodline" size="large" />
              <div>
                <span>{bl.useMode ? 'Mode source' : 'Equipped'}</span>
                <h3>{bl.name}</h3>
              </div>
            </div>
            <dl>
              <div><dt>Purpose</dt><dd>{bl.purpose || 'Not documented'}</dd></div>
              <div><dt>Represents</dt><dd>{bl.represents || 'Not specified'}</dd></div>
              <div><dt>Mode</dt><dd>{bl.useMode ? 'Yes' : 'No'}</dd></div>
            </dl>
            {bl.exactMovesUsed.length > 0 && (
              <>
                <h4>Selected moves</h4>
                <ul>{bl.exactMovesUsed.map((m) => <li key={m}>{m}</li>)}</ul>
              </>
            )}
            {bl.reason && <p className="ability-slot__replacement">{bl.reason}</p>}
            {(bl.replacements.lore.length > 0 || bl.replacements.competitive.length > 0 || bl.replacements.accessible.length > 0) && (
              <>
                <h4>Alternatives</h4>
                {bl.replacements.lore.length > 0 && <p>Lore: {bl.replacements.lore.join(', ')}</p>}
                {bl.replacements.competitive.length > 0 && <p>Competitive: {bl.replacements.competitive.join(', ')}</p>}
                {bl.replacements.accessible.length > 0 && <p>Accessible: {bl.replacements.accessible.join(', ')}</p>}
              </>
            )}
          </article>
        ))}
      </div>
      <h3>Elements ({variant.elementSlotCount} slots)</h3>
      <div className="element-slot-grid">
        {variant.elements.map((el) => (
          <article key={el.name}>
            <ShindoIcon name={el.name} type="Element" size="large" />
            <div>
              <h3>{el.name}</h3>
              <p>{el.purpose || 'Purpose not documented'}</p>
              {el.exactMovesUsed.length > 0 && <p>Moves: {el.exactMovesUsed.join(', ')}</p>}
              {el.replacements.length > 0 && <p>Alternatives: {el.replacements.join(', ')}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function ModesSection({ variant }: { variant: BuildVariant }) {
  const hasMode = !isNone(variant.cMode) || !isNone(variant.zMode)
  const hasModeDetail = variant.primaryMode || variant.submode || variant.modeStage
  return (
    <section className="build-section" id="section-modes">
      <SectionHeading id="h-modes" eyebrow="Section 4" title="Modes and Submodes" subtitle="Mode activation, compatibility, and legality." />
      <div className="modes-grid">
        <div className="mode-card">
          <span>C-mode</span>
          <strong>{variant.cMode}</strong>
          {variant.modeActivationKey && <small>Key: {variant.modeActivationKey}</small>}
        </div>
        <div className="mode-card">
          <span>Z-mode</span>
          <strong>{variant.zMode}</strong>
        </div>
        {hasModeDetail && (
          <>
            {variant.primaryMode && <div className="mode-card"><span>Primary mode</span><strong>{variant.primaryMode}</strong></div>}
            {variant.submode && <div className="mode-card"><span>Submode</span><strong>{variant.submode}</strong></div>}
            {variant.modeStage && <div className="mode-card"><span>Stage</span><strong>{variant.modeStage}</strong></div>}
          </>
        )}
      </div>
      {hasMode && !isNone(variant.cMode) && !isNone(variant.zMode) && (
        <div className="mode-compatibility-warning">
          <Shield size={16} />
          <div>
            <strong>Simultaneous mode legality: {variant.simultaneousModeLegality ?? 'untested'}</strong>
            {variant.modeCompatibilityWarning && <p>{variant.modeCompatibilityWarning}</p>}
            {!variant.modeCompatibilityWarning && <p>Both C-mode and Z-mode are recommended. Confirm their controls and appearance work together.</p>}
          </div>
        </div>
      )}
      {!hasMode && <EmptyResearchState label="No mode is recommended for this build." />}
      {variant.modeRecommendation && <p className="mode-recommendation"><strong>Mode recommendation:</strong> {variant.modeRecommendation}</p>}
      {variant.submodeRecommendation && <p className="mode-recommendation"><strong>Submode recommendation:</strong> {variant.submodeRecommendation}</p>}
    </section>
  )
}

export function UtilitySection({ variant }: { variant: BuildVariant }) {
  const activeMoves = variant.hotbar.filter((s) => s.ability && !isNone(s.ability))
  const groups = useMemo(() => {
    const map: Record<string, HotbarSlot[]> = {}
    for (const slot of activeMoves) {
      if (slot.roleTags?.length) {
        for (const tag of slot.roleTags) (map[tag] ??= []).push(slot)
      } else {
        const role = slot.comboRole.toLowerCase()
        let category = 'general'
        if (/counter|defen|reversal/.test(role)) category = 'counter'
        else if (/evas|dodge|escape/.test(role)) category = 'evasive'
        else if (/move|dash|teleport/.test(role)) category = 'movement'
        else if (/guard|block.*break/.test(role)) category = 'guard-break'
        else if (/starter|opener|initiat/.test(role)) category = 'starter'
        else if (/extend/.test(role)) category = 'combo-extender'
        else if (/finish|ender/.test(role)) category = 'combo-ender'
        else if (/heal|regen/.test(role)) category = 'healing'
        else if (/range|projectile/.test(role)) category = 'ranged-pressure'
        else if (/area|aoe/.test(role)) category = 'area-control'
        else if (/pressure/.test(role)) category = 'ranged-pressure'
        ;(map[category] ??= []).push(slot)
      }
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [activeMoves])

  const tagLabels: Record<string, string> = {
    'starter': 'Starters',
    'combo-extender': 'Combo extenders',
    'combo-ender': 'Combo enders',
    'guard-break': 'Guard break',
    'counter': 'Counters and defense',
    'evasive': 'Evasive',
    'movement': 'Movement',
    'ranged-pressure': 'Ranged pressure',
    'area-control': 'Area control',
    'defensive-utility': 'Defensive utility',
    'healing': 'Healing / Regeneration',
    'transformation': 'Transformation',
    'signature': 'Character signature',
    'general': 'General',
  }

  return (
    <section className="build-section" id="section-utility">
      <SectionHeading id="h-utility" eyebrow="Section 5" title="Sub-Jutsu and utility" subtitle="Abilities grouped by tactical function." />
      {groups.length === 0 ? (
        <EmptyResearchState label="No role tags or tactical groupings are available for this build yet." />
      ) : (
        <div className="utility-groups">
          {groups.map(([tag, slots]) => (
            <div key={tag} className="utility-group">
              <h3>{tagLabels[tag] ?? tag.replace(/-/g, ' ')}</h3>
              <div className="utility-slots">
                {slots.map((slot) => (
                  <div key={slot.id} className="utility-slot">
                    <kbd>{slot.key}</kbd>
                    <ShindoIcon name={slot.source} size="medium" />
                    <div>
                      <strong>{slot.ability}</strong>
                      <small>{slot.source} · {slot.comboRole}</small>
                      <ResearchStatusBadge status={slot.researchStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function EquipmentSection({ variant }: { variant: BuildVariant }) {
  const equipment = variantEquipment(variant)
  const kenjutsu = variantKenjutsu(variant)
  const qSlot = variant.hotbar.find((s) => s.key === 'Q')

  return (
    <section className="build-section" id="section-equipment">
      <SectionHeading id="h-equipment" eyebrow="Section 6" title="Weapons and equipment" subtitle="Combat Art, Kenjutsu, weapon, ninja tools, and support equipment." />
      <div className="equipment-grid">
        <EquipmentCard label="Combat Art" value={variant.combatArt} reason={variant.combatArtReason} />
        <EquipmentCard label="Kenjutsu" value={kenjutsu} reason={variant.kenjutsuReason} />
        <EquipmentCard label="Weapon" value={variant.weapon} reason={variant.weaponReason} />
        <EquipmentCard label="Q action" value={qSlot ? `${qSlot.source}: ${qSlot.ability}` : 'None'} reason={qSlot?.usageNotes} />
        <EquipmentCard label="Ninja tool" value={equipment.ninjaTool} reason={equipment.ninjaToolReason} />
        <EquipmentCard label="Consumable" value={equipment.consumable} reason={equipment.consumableReason} />
        <EquipmentCard label="Mentor" value={equipment.mentor} reason={equipment.mentorReason} />
        <EquipmentCard label="Race" value={equipment.race} reason={equipment.raceReason} />
      </div>
      {isNone(variant.weapon) && !variant.weaponReason && (
        <div className="equipment-notice">
          <span>No weapon selected</span>
          <p>No weapon decision has been documented. This may be intentional or may need research.</p>
        </div>
      )}
    </section>
  )
}

function EquipmentCard({ label, value, reason }: { label: string; value: string; reason?: string }) {
  const empty = isNone(value)
  return (
    <article className={`equipment-card${empty ? ' is-empty' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {reason && <small>{reason}</small>}
      {empty && !reason && <small>Not selected</small>}
    </article>
  )
}

export function StatsPlaystyleSection({ variant }: { variant: BuildVariant }) {
  const hasStats = variant.statsAllocation && Object.keys(variant.statsAllocation).length > 0

  return (
    <section className="build-section" id="section-stats">
      <SectionHeading id="h-stats" eyebrow="Section 7" title="Stats and playstyle" subtitle="Stat allocation, tactical approach, strengths, and weaknesses." />
      {hasStats ? (
        <div className="stats-allocation">
          <h3>Stat allocation</h3>
          <div className="stats-bars">
            {Object.entries(variant.statsAllocation!).map(([stat, value]) => (
              <div key={stat} className="stat-bar">
                <span>{stat}</span>
                <div className="stat-bar__track"><div className="stat-bar__fill" style={{ width: `${Math.min(value, 100)}%` }} /></div>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyResearchState label="Stat allocation has not been researched for this build." />
      )}
      {variant.neutralGamePlan && (
        <div className="neutral-plan">
          <h3>Neutral game plan</h3>
          <p>{variant.neutralGamePlan}</p>
        </div>
      )}
      <div className="playstyle-columns">
        <article>
          <h3>Strengths</h3>
          {variant.strengths.length > 0 ? <ul>{variant.strengths.map((s) => <li key={s}>{s}</li>)}</ul> : <EmptyResearchState label="Not documented" />}
        </article>
        <article>
          <h3>Weaknesses</h3>
          {variant.weaknesses.length > 0 ? <ul>{variant.weaknesses.map((s) => <li key={s}>{s}</li>)}</ul> : <EmptyResearchState label="Not documented" />}
        </article>
        <article>
          <h3>Usage guide</h3>
          {variant.usageGuide.length > 0 ? <ul>{variant.usageGuide.map((s) => <li key={s}>{s}</li>)}</ul> : <EmptyResearchState label="Not documented" />}
        </article>
      </div>
      <div className="ratings-row">
        {(['accuracy', 'pvp', 'mobility', 'combos', 'defense', 'visuals', 'aura', 'difficulty'] as const).map((key) => (
          <div key={key} className="rating-cell">
            <span>{key}</span>
            <b>{variant.ratings[key].toFixed(1)}</b>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ComboSection({ variant }: { variant: BuildVariant }) {
  const hasNewCombos = variant.opener?.length || variant.mainCombo?.length || variant.alternateCombo?.length || variant.escapeRoute?.length
  return (
    <section className="build-section" id="section-combos">
      <SectionHeading id="h-combos" eyebrow="Section 9" title="Combos" subtitle="Opener, main combo, alternate routes, and escape." />
      {hasNewCombos && (
        <div className="combo-routes">
          {variant.opener?.length ? <ComboRoute label="Opener" steps={variant.opener} /> : null}
          {variant.mainCombo?.length ? <ComboRoute label="Main combo" steps={variant.mainCombo} /> : null}
          {variant.alternateCombo?.length ? <ComboRoute label="Alternate combo" steps={variant.alternateCombo} /> : null}
          {variant.escapeRoute?.length ? <ComboRoute label="Escape / Reset" steps={variant.escapeRoute} /> : null}
        </div>
      )}
      {variant.combos.length > 0 ? (
        <div className="combo-list">
          {variant.combos.map((combo) => (
            <article key={combo.name}>
              <div>
                <h3>{combo.name}</h3>
                <div className="key-sequence">
                  {combo.sequence.map((step, i) => <kbd key={`${step}-${i}`}>{step}</kbd>)}
                </div>
              </div>
              <p>{combo.explanation}</p>
            </article>
          ))}
        </div>
      ) : !hasNewCombos ? (
        <EmptyResearchState label="No combos have been documented for this variant." />
      ) : null}
    </section>
  )
}

function ComboRoute({ label, steps }: { label: string; steps: string[] }) {
  return (
    <div className="combo-route">
      <h4>{label}</h4>
      <div className="key-sequence">
        {steps.map((step, i) => <kbd key={`${step}-${i}`}>{step}</kbd>)}
      </div>
    </div>
  )
}

export function BuildAuditPanel({ variant, legalityIssues }: {
  variant: BuildVariant
  legalityIssues: { code: string; severity: string; message: string }[]
}) {
  const qualityIssues = useMemo(() => auditVariant(variant), [variant])
  const allIssues = [...qualityIssues, ...legalityIssues.map((i) => ({ ...i, variantId: variant.id, title: i.code } as BuildQualityIssue))]
  const criticals = allIssues.filter((i) => i.severity === 'Critical')
  const majors = allIssues.filter((i) => i.severity === 'Major')
  const minors = allIssues.filter((i) => i.severity === 'Minor')
  const editorials = allIssues.filter((i) => i.severity === 'Editorial')

  return (
    <section className="build-section" id="section-legality">
      <SectionHeading id="h-legality" eyebrow="Section 11" title="Legality and warnings" subtitle="Structural validation, source checks, and quality audit findings." />
      {allIssues.length === 0 ? (
        <div className="audit-clean">
          <Shield size={22} />
          <p>No legality or quality warnings. All structural checks passed.</p>
        </div>
      ) : (
        <div className="audit-issues" role="list" aria-label="Build audit findings">
          {criticals.length > 0 && <IssueGroup label="Critical" issues={criticals} />}
          {majors.length > 0 && <IssueGroup label="Major" issues={majors} />}
          {minors.length > 0 && <IssueGroup label="Minor" issues={minors} />}
          {editorials.length > 0 && <IssueGroup label="Editorial" issues={editorials} />}
        </div>
      )}
    </section>
  )
}

function IssueGroup({ label, issues }: { label: string; issues: BuildQualityIssue[] }) {
  return (
    <div className="audit-group" role="listitem">
      <h3 className={`audit-severity audit-severity--${label.toLowerCase()}`}>
        <AlertTriangle size={14} /> {label} ({issues.length})
      </h3>
      <ul>
        {issues.map((issue) => (
          <li key={issue.code}>
            <strong>{issue.title}</strong>
            <span>{issue.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ResearchEvidenceSection({ build, variant }: {
  build: CharacterBuild
  variant: BuildVariant
}) {
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null)

  return (
    <section className="build-section" id="section-research">
      <SectionHeading id="h-research" eyebrow="Section 12" title="Accuracy and evidence" subtitle="Research record, evidence sources, and verification status." />
      <div className="research-status-grid">
        <div className="research-card">
          <span>Verification</span>
          <strong>{variant.verificationStatus}</strong>
        </div>
        <div className="research-card">
          <span>Owner testing</span>
          <strong>{variant.ownerTestingStatus ?? 'Not tested'}</strong>
        </div>
        <div className="research-card">
          <span>Confidence</span>
          <strong>{build.confidence}</strong>
        </div>
        <div className="research-card">
          <span>Target update</span>
          <strong>{variant.targetShindoUpdate ?? variant.researchedGameVersion ?? 'Not specified'}</strong>
        </div>
      </div>
      {variant.researcherNotes && (
        <div className="researcher-notes">
          <h3>Researcher notes</h3>
          <p>{variant.researcherNotes}</p>
        </div>
      )}
      {(variant.compromises?.length || build.knownCompromises.length > 0) && (
        <div className="known-compromises">
          <h3>Known compromises</h3>
          <ul>{(variant.compromises ?? build.knownCompromises).map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      )}
      {build.evidence.length > 0 ? (
        <div className="evidence-list">
          {build.evidence.map((ev) => {
            const key = `${ev.category}-${ev.claim}`
            const expanded = expandedEvidence === key
            return (
              <article key={key}>
                <button className="evidence-toggle" onClick={() => setExpandedEvidence(expanded ? null : key)} aria-expanded={expanded}>
                  <span className="evidence-category">{ev.category}</span>
                  <strong>{ev.claim}</strong>
                  <ChevronDown size={14} />
                </button>
                {expanded && (
                  <div className="evidence-details">
                    <p><b>Source:</b> {ev.sourceTitle}</p>
                    <p><b>Reference:</b> {ev.sourceReference}</p>
                    <p><b>Checked:</b> {ev.checkedAt}</p>
                    <small>{ev.notes}</small>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyResearchState label="No evidence sources have been documented for this build." />
      )}
      <div className="hotbar-research-summary">
        <h3>Hotbar slot research status</h3>
        <div className="hotbar-research-list" role="list" aria-label="Hotbar research status per slot">
          {variant.hotbar.map((slot) => (
            <div key={slot.id} className="hotbar-research-item" role="listitem">
              <kbd>{slot.key}</kbd>
              <span>{slot.ability || 'Empty'}</span>
              <ResearchStatusBadge status={slot.researchStatus} />
              {slot.evidenceNote && <small>{slot.evidenceNote}</small>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HotbarDossier({
  hotbar,
  selectedMoveId,
  onSelect,
}: {
  hotbar: HotbarSlot[]
  selectedMoveId: string | null
  onSelect: (id: string | null) => void
}) {
  const rows: [string, HotbarKey[]][] = [
    ['General / element row', ['1', '2', '3', '4', '5', 'T']],
    ['Bloodline row', ['V', 'B', 'N']],
    ['Modes and Q', ['C', 'Z', 'Q']],
  ]
  return (
    <div className="dossier-hotbar" role="list" aria-label="Technical hotbar view">
      {rows.map(([label, keys]) => (
        <div className={`dossier-hotbar__row row-${keys[0].toLowerCase()}`} key={label} role="listitem">
          <span>{label}</span>
          <div>
            {keys.map((key) => {
              const slot = hotbar.find((item) => item.key === key)!
              const empty = !slot.canonicalMoveId
              return (
                <button
                  key={key}
                  className={`${empty ? 'is-empty' : ''} ${selectedMoveId === slot.canonicalMoveId ? 'is-active' : ''}`}
                  onClick={() => onSelect(slot.canonicalMoveId ?? null)}
                  disabled={empty}
                >
                  <kbd>{key}</kbd>
                  {!empty && <ShindoIcon name={slot.source} size="large" />}
                  <strong>{slot.ability}</strong>
                  <small>{empty ? slot.usageNotes : `${slot.source} · ${slot.comboRole}`}</small>
                  <ResearchStatusBadge status={slot.researchStatus} />
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export function HotbarSection({
  variant,
  hotbarView,
  onHotbarViewChange,
  selectedMoveId,
  onSelectMove,
  onCopyHotbar,
}: {
  variant: BuildVariant
  hotbarView: 'game' | 'technical'
  onHotbarViewChange: (view: 'game' | 'technical') => void
  selectedMoveId: string | null
  onSelectMove: (id: string | null) => void
  onCopyHotbar: () => void
}) {
  return (
    <section className="build-section" id="section-hotbar">
      <div className="hotbar-heading-row">
        <SectionHeading id="h-hotbar" eyebrow="Section 8" title="Hotbar / Game view" subtitle="Game view follows the owner HUD reference; Technical view preserves canonical archive keys and legality." />
        <div className="hotbar-view-toggle" role="group" aria-label="Hotbar display mode">
          <button className={hotbarView === 'game' ? 'is-active' : ''} onClick={() => onHotbarViewChange('game')}>Game view</button>
          <button className={hotbarView === 'technical' ? 'is-active' : ''} onClick={() => onHotbarViewChange('technical')}>Technical view</button>
        </div>
      </div>
      {hotbarView === 'game' ? (
        <GameHotbarPreview hotbar={variant.hotbar} selectedMoveId={selectedMoveId} onSelect={onSelectMove} />
      ) : (
        <HotbarDossier hotbar={variant.hotbar} selectedMoveId={selectedMoveId} onSelect={onSelectMove} />
      )}
      <div className="section-actions">
        <button className="button button--outline" onClick={onCopyHotbar}><Clipboard size={15} /> Copy hotbar</button>
      </div>
    </section>
  )
}

export function AlternativesSection({
  build,
  variant,
  collection,
  onSelectVariant,
}: {
  build: CharacterBuild
  variant: BuildVariant
  collection: CollectionState
  onSelectVariant: (id: string) => void
}) {
  const [compareId, setCompareId] = useState('')
  const recommended = useMemo(() => build.variants.find((v) => v.type === 'Primary') ?? build.variants[0], [build.variants])
  const recommendedMatch = useMemo(() => inventoryMatch(recommended, collection), [recommended, collection])
  const closest = useMemo(() => closestPreparedVariant(build.variants, collection), [build.variants, collection])
  const compare = build.variants.find((v) => v.id === compareId)

  return (
    <section className="build-section" id="section-alternatives">
      <SectionHeading id="h-alternatives" eyebrow="Section 10" title="Alternatives" subtitle="Inventory-compatible profiles and accuracy vs viability tradeoffs." />
      <div className="inventory-recommendation">
        <PackageCheck size={24} />
        <div>
          <span>Recommended</span>
          <strong>{recommended.name}</strong>
          <p>{recommendedMatch.missing.length ? `Missing: ${recommendedMatch.missing.join(', ')}` : 'Complete from your inventory.'}</p>
        </div>
        <div>
          <span>Closest prepared profile</span>
          <strong>{closest.variant.name}</strong>
          <p>{closest.missing.length ? `${closest.missing.length} tracked item(s) missing` : 'Complete from your inventory'}</p>
        </div>
        <button className="button button--primary" onClick={() => onSelectVariant(closest.variant.id)}>Use my inventory</button>
      </div>
      <div className="variant-card-grid">
        {build.variants.map((v) => {
          const match = inventoryMatch(v, collection)
          return (
            <button key={v.id} className={v.id === variant.id ? 'is-active' : ''} onClick={() => onSelectVariant(v.id)}>
              <span>{v.type}</span>
              <strong>{v.name}</strong>
              <small>{v.hotbarLegalityStatus ?? 'Research pending'} · {match.missing.length ? `${match.missing.length} missing` : 'Ready'}</small>
            </button>
          )
        })}
      </div>
      <label className="variant-compare-picker">
        Compare current variant with
        <select value={compareId} onChange={(e) => setCompareId(e.target.value)}>
          <option value="">Choose another profile</option>
          {build.variants.filter((v) => v.id !== variant.id).map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </label>
      {compare && <VariantComparisonTable left={variant} right={compare} collection={collection} />}
    </section>
  )
}

function VariantComparisonTable({ left, right, collection }: { left: BuildVariant; right: BuildVariant; collection: CollectionState }) {
  const rows = [
    ['Bloodlines', left.bloodlines.map((i) => i.name).join(', '), right.bloodlines.map((i) => i.name).join(', ')],
    ['Elements', left.elements.map((i) => i.name).join(', '), right.elements.map((i) => i.name).join(', ')],
    ['Modes', `${left.cMode} / ${left.zMode}`, `${right.cMode} / ${right.zMode}`],
    ['Weapon', left.weapon, right.weapon],
    ['Inventory gaps', inventoryMatch(left, collection).missing.join(', ') || 'None', inventoryMatch(right, collection).missing.join(', ') || 'None'],
    ['Accuracy', left.ratings.accuracy.toFixed(1), right.ratings.accuracy.toFixed(1)],
    ['PvP', left.ratings.pvp.toFixed(1), right.ratings.pvp.toFixed(1)],
  ]
  return (
    <div className="variant-comparison">
      <header><span>Field</span><strong>{left.name}</strong><strong>{right.name}</strong></header>
      {rows.map(([label, a, b]) => (
        <div className={a !== b ? 'is-different' : ''} key={label}><span>{label}</span><p>{a}</p><p>{b}</p></div>
      ))}
    </div>
  )
}
