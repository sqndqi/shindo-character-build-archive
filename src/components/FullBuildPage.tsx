import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, Bell, Bookmark, Check, ChevronDown, Clipboard, GitCompareArrows, MessageCircleWarning, PackageCheck } from 'lucide-react'
import type { BuildVariant, CharacterBuild, HotbarSlot } from '../types'
import type { CollectionState } from '../hooks/useBloodlineCollection'
import type { ShindoAssetType } from '../data/shindoAssetManifest'
import { auditVariant } from '../lib/buildQuality'
import { closestPreparedVariant, inventoryMatch, variantEquipment, variantKenjutsu, variantQAction } from '../lib/variants'
import { Portrait } from './Portrait'
import { Score } from './Score'
import { ShindoIcon } from './ShindoIcon'

const sections = [
  ['overview', 'Overview'],
  ['abilities', 'Abilities'],
  ['hotbar', 'Hotbar'],
  ['combos', 'Combos'],
  ['alternatives', 'Alternatives'],
  ['accuracy', 'Accuracy'],
] as const

export function FullBuildPage({
  build,
  initialVariantId,
  collection,
  variantFavorites,
  watchlist,
  onBack,
  onVariantRoute,
  onFavoriteVariant,
  onWatch,
  onReportIssue,
  onViewed,
}: {
  build: CharacterBuild
  initialVariantId?: string
  collection: CollectionState
  variantFavorites: string[]
  watchlist: string[]
  onBack: () => void
  onVariantRoute: (variantId: string) => void
  onFavoriteVariant: (variantId: string) => void
  onWatch: (buildId: string) => void
  onReportIssue: (variant: string) => void
  onViewed: (buildId: string) => void
}) {
  const recommended = build.variants.find((item) => item.type === 'Primary') ?? build.variants[0]
  const initial = build.variants.find((item) => item.id === initialVariantId) ?? recommended
  const [variantId, setVariantId] = useState(initial.id)
  const [expandedMoves, setExpandedMoves] = useState<string[]>([])
  const [compareId, setCompareId] = useState('')
  const variant = build.variants.find((item) => item.id === variantId) ?? recommended
  const equipment = variantEquipment(variant)
  const qAction = variantQAction(variant)
  const quality = useMemo(() => auditVariant(variant), [variant])
  const currentMatch = useMemo(() => inventoryMatch(variant, collection), [collection, variant])
  const recommendedMatch = useMemo(() => inventoryMatch(recommended, collection), [collection, recommended])
  const closest = useMemo(() => closestPreparedVariant(build.variants, collection), [build.variants, collection])
  const compare = build.variants.find((item) => item.id === compareId)
  const isDraft = build.publicationStatus !== 'Reviewed'

  useEffect(() => { onViewed(build.id); window.scrollTo({ top: 0, behavior: 'instant' }) }, [build.id, onViewed])
  useEffect(() => {
    const found = build.variants.find((item) => item.id === initialVariantId)
    if (found) setVariantId(found.id)
  }, [build.variants, initialVariantId])

  const selectVariant = (id: string) => {
    setVariantId(id)
    setExpandedMoves([])
    onVariantRoute(id)
  }
  const copy = (text: string) => navigator.clipboard.writeText(text)
  const fullLoadout = [
    `Bloodlines: ${variant.bloodlines.map((slot) => slot.name).join(', ')}`,
    `Elements: ${variant.elements.map((slot) => slot.name).join(', ')}`,
    `C-mode: ${variant.cMode}`,
    `Z-mode: ${variant.zMode}`,
    `Combat Art: ${variant.combatArt}`,
    `Kenjutsu: ${variantKenjutsu(variant)}`,
    `Weapon: ${variant.weapon}`,
    `Q: ${qAction.name}`,
    `Ninja tool: ${equipment.ninjaTool}`,
    `Consumable: ${equipment.consumable}`,
    `Mentor: ${equipment.mentor}`,
    `Race: ${equipment.race}`,
  ].join('\n')

  return <main className="full-build-page">
    <button className="build-back button button--text" onClick={onBack}><ArrowLeft size={17} /> Back to archive</button>
    <header className="build-hero">
      <div className="build-hero__portrait"><Portrait src={build.image} alt={build.name} /></div>
      <div className="build-hero__content">
        <div className="build-hero__actions">
          <button className={`button button--outline ${variantFavorites.includes(variant.id) ? 'is-active' : ''}`} onClick={() => onFavoriteVariant(variant.id)}><Bookmark size={15} fill={variantFavorites.includes(variant.id) ? 'currentColor' : 'none'} /> Bookmark variant</button>
          <button className={`button button--outline ${watchlist.includes(build.id) ? 'is-active' : ''}`} onClick={() => onWatch(build.id)}><Bell size={15} /> {watchlist.includes(build.id) ? 'On update watchlist' : 'Watch for retest'}</button>
        </div>
        <div className="tag-row"><span className={`status-badge status-badge--${build.publicationStatus.toLowerCase().replaceAll(' ', '-')}`}>{build.publicationStatus}</span><span className="tag">{variant.verificationStatus}</span><span className="tag">{build.confidence}</span></div>
        <p className="eyebrow">{build.series} · {build.version}</p>
        <h1>{build.name}</h1>
        <p>{build.description}</p>
        <div className="build-hero__meta"><span><b>Arc</b>{build.version}</span><span><b>Last checked</b>{variant.lastVerifiedUpdate}</span><span><b>Owner test</b>{build.testing.status}</span></div>
      </div>
    </header>

    {isDraft && <aside className="draft-notice"><strong>{build.publicationStatus}</strong><span>This early draft keeps its researched concept data, but exact alternatives and live move timing are still being researched.</span></aside>}

    <section className="loadout-summary" aria-label="Immediate loadout summary">
      <div className="loadout-summary__header">
        <label>Prepared variant<select value={variant.id} onChange={(event) => selectVariant(event.target.value)}>{build.variants.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.bloodlineSlotCount}×{item.elementSlotCount}</option>)}</select></label>
        <div><span>{variant.bloodlineSlotCount} Bloodline slots</span><span>{variant.elementSlotCount} element slots</span></div>
      </div>
      <LoadoutGroup title="Bloodlines">{variant.bloodlines.map((slot, index) => <AssetFact key={`${slot.name}-${index}`} label={`Slot ${index + 1}`} name={slot.name} type="Bloodline" />)}</LoadoutGroup>
      <LoadoutGroup title="Elements">{variant.elements.map((slot, index) => <AssetFact key={`${slot.name}-${index}`} label={`Element ${index + 1}`} name={slot.name} type="Element" />)}</LoadoutGroup>
      <LoadoutGroup title="Modes"><AssetFact label="C-mode" name={variant.cMode} type="Mode" /><AssetFact label="Z-mode" name={variant.zMode} type="Mode" /></LoadoutGroup>
      <LoadoutGroup title="Fighting"><AssetFact label="Combat Art" name={variant.combatArt} type="Combat Art" /><AssetFact label="Kenjutsu" name={variantKenjutsu(variant)} type="Kenjutsu" /><AssetFact label="Weapon" name={variant.weapon} type="Weapon" /><TextFact label="Q action" value={qAction.name} /></LoadoutGroup>
      <LoadoutGroup title="Support"><TextFact label="Ninja tool" value={equipment.ninjaTool} /><TextFact label="Consumable" value={equipment.consumable} /><TextFact label="Mentor" value={equipment.mentor} /><TextFact label="Race" value={equipment.race} /></LoadoutGroup>
    </section>

    <nav className="build-section-nav" aria-label="Build sections">
      <label>Jump to section<select onChange={(event) => document.getElementById(event.target.value)?.scrollIntoView()}>{sections.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select><ChevronDown size={15} /></label>
      <div>{sections.map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}</div>
    </nav>

    <section id="overview" className="build-section">
      <SectionHeading eyebrow="Prepared setup" title="Why this version fits" />
      <div className="build-overview-grid">
        <div><p>{build.description}</p><ul>{variant.fightingStyleNotes?.map((note) => <li key={note}>{note}</li>) ?? build.characterAbilities.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div className="ratings-panel">{(['accuracy', 'pvp', 'mobility', 'defense', 'difficulty'] as const).map((key) => <Score key={key} label={key} value={variant.ratings[key]} />)}</div>
      </div>
      <div className="reason-grid">
        <ReasonCard title="Combat Art" value={variant.combatArt} reason={variant.combatArtReason ?? 'Editorial reason still needs review.'} />
        <ReasonCard title="Kenjutsu" value={variantKenjutsu(variant)} reason={variant.kenjutsuReason ?? 'No separately authored Kenjutsu reason is available yet.'} />
        <ReasonCard title="Weapon and Q" value={`${variant.weapon} · ${qAction.name}`} reason={variant.weaponReason ?? qAction.purpose} />
        <ReasonCard title="Equipment" value={`${equipment.ninjaTool} · ${equipment.consumable}`} reason={`${equipment.ninjaToolReason} ${equipment.consumableReason}`} />
      </div>
    </section>

    <section id="abilities" className="build-section">
      <SectionHeading eyebrow="Identity mapping" title="Abilities used" />
      <div className="ability-slot-grid">{variant.bloodlines.map((slot, index) => <article className="ability-slot" key={`${slot.name}-${index}`}>
        <div className="ability-slot__heading"><ShindoIcon name={slot.name} type="Bloodline" size="large" /><div><span>Bloodline slot {index + 1}</span><h3>{slot.name}</h3></div></div>
        <p>{slot.reason}</p>
        <dl><div><dt>Represents</dt><dd>{slot.represents}</dd></div><div><dt>Mode</dt><dd>{slot.useMode ? 'Enabled for this variant' : 'Disabled'}</dd></div><div><dt>Accuracy</dt><dd>{slot.reason.split(':')[0]}</dd></div></dl>
        <h4>Used moves</h4><ul>{slot.exactMovesUsed.length ? slot.exactMovesUsed.map((move) => <li key={move}>{move}</li>) : <li>Exact moves unresolved</li>}</ul>
        <p className="ability-slot__replacement"><b>Accessible replacement:</b> {slot.replacements.accessible[0] ?? 'No prepared replacement'}</p>
      </article>)}</div>
      <div className="element-slot-grid">{variant.elements.map((slot) => <article key={slot.name}><ShindoIcon name={slot.name} type="Element" size="large" /><div><h3>{slot.name}</h3><p>{slot.purpose}</p><small>{slot.exactMovesUsed.join(' · ') || 'Exact moves unresolved'}</small></div></article>)}</div>
    </section>

    <section id="hotbar" className="build-section">
      <SectionHeading eyebrow="Controls" title={isDraft ? 'Hotbar research outline' : 'Prepared hotbar'} />
      <div className="section-actions"><button className="button button--outline" onClick={() => setExpandedMoves(variant.hotbar.map((slot) => slot.id))}>Expand all</button><button className="button button--outline" onClick={() => setExpandedMoves([])}>Collapse all</button><button className="button button--outline" onClick={() => copy(variant.hotbar.map((slot) => `${slot.key} — ${slot.ability}`).join('\n'))}><Clipboard size={15} /> Copy hotbar</button></div>
      <div className="visual-hotbar" aria-label="Shindo-style hotbar">{variant.hotbar.map((slot) => <button key={slot.id} className={isEmptyMove(slot) ? 'is-empty' : ''} onClick={() => setExpandedMoves((current) => current.includes(slot.id) ? current.filter((id) => id !== slot.id) : [...current, slot.id])} aria-expanded={expandedMoves.includes(slot.id)}><kbd>{slot.key}</kbd><ShindoIcon name={slot.source} size="medium" /><span>{slot.ability}</span></button>)}</div>
      <div className="move-list">{variant.hotbar.map((slot) => <MoveRow slot={slot} expanded={expandedMoves.includes(slot.id)} onToggle={() => setExpandedMoves((current) => current.includes(slot.id) ? current.filter((id) => id !== slot.id) : [...current, slot.id])} key={slot.id} />)}</div>
    </section>

    <section id="combos" className="build-section">
      <SectionHeading eyebrow="Testing routes" title="Combos and usage" />
      {variant.combos.length ? <div className="combo-list">{variant.combos.map((combo) => <article key={combo.name}><div className="key-sequence">{combo.sequence.map((key, index) => <kbd key={`${key}-${index}`}>{key}</kbd>)}</div><div><h3>{combo.name}</h3><p>{combo.explanation}</p><button className="button button--text" onClick={() => copy(`${combo.name}: ${combo.sequence.join(' → ')}\n${combo.explanation}`)}>Copy route</button></div></article>)}</div> : <p>Combo routes are still being researched for this build.</p>}
      <div className="notes-columns"><div><h3>How to use it</h3><ul>{variant.usageGuide.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Strengths</h3><ul>{variant.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Weaknesses</h3><ul>{variant.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
    </section>

    <section id="alternatives" className="build-section">
      <SectionHeading eyebrow="Prepared alternatives" title={build.publicationStatus === 'Reviewed' ? 'Choose a complete setup' : 'Alternative builds are still being researched'} />
      {build.publicationStatus === 'Reviewed' && <>
        <div className="inventory-recommendation"><PackageCheck size={23} /><div><span>Recommended</span><strong>{recommended.name}</strong><p>{recommendedMatch.missing.length ? `Missing: ${recommendedMatch.missing.join(', ')}` : 'You own every tracked item for this setup.'}</p></div><div><span>Best you can make</span><strong>{closest.variant.name}</strong><p>{closest.missing.length ? `${closest.missing.length} tracked item${closest.missing.length === 1 ? '' : 's'} missing` : 'Complete from your inventory'}</p></div><button className="button button--primary" onClick={() => selectVariant(closest.variant.id)}>Use my inventory</button></div>
        <BuildChecklist variant={variant} collection={collection} />
        <div className="variant-card-grid">{build.variants.map((item) => {
          const match = inventoryMatch(item, collection)
          return <button key={item.id} className={item.id === variant.id ? 'is-active' : ''} onClick={() => selectVariant(item.id)}><span>{item.type}</span><strong>{item.name}</strong><small>{item.bloodlineSlotCount} Bloodlines · {item.elementSlotCount} elements</small><em>{match.missing.length ? `Missing ${match.missing.length}: ${match.missing.slice(0, 2).join(', ')}` : 'Ready from inventory'}</em></button>
        })}</div>
        <div className="alternative-compare-controls"><GitCompareArrows size={18} /><label>Compare current variant with<select value={compareId} onChange={(event) => setCompareId(event.target.value)}><option value="">Choose an alternative</option>{build.variants.filter((item) => item.id !== variant.id).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div>
        {compare && <VariantComparison left={variant} right={compare} collection={collection} />}
      </>}
    </section>

    <section id="accuracy" className="build-section">
      <SectionHeading eyebrow="Editorial and testing" title="Accuracy and build quality" />
      <div className="quality-summary"><p><b>{variant.verificationStatus}</b> · {build.confidence} · {variant.lastVerifiedUpdate}</p><p><b>Owner testing:</b> {build.testing.status}. Schema checks do not verify live timing, current guard behavior, or balance.</p><p><b>Known compromises:</b> {(variant.compromises?.length ? variant.compromises : build.knownCompromises).join(' ')}</p>
        {quality.length ? <ul>{quality.map((issue) => <li key={`${issue.code}-${issue.variantId}`}><span className={`quality-severity quality-severity--${issue.severity.toLowerCase()}`}>{issue.severity}</span><b>{issue.title}</b> — {issue.message}</li>)}</ul> : <p>No static consistency warnings. Live gameplay testing is still required.</p>}
      </div>
      <div className="section-actions"><button className="button button--outline" onClick={() => onReportIssue(variant.name)}><MessageCircleWarning size={15} /> Report a build issue</button><button className="button button--outline" onClick={() => copy(fullLoadout)}><Clipboard size={15} /> Copy full loadout</button><button className="button button--outline" onClick={() => copy(variant.bloodlines.map((slot) => slot.name).join('\n'))}><Clipboard size={15} /> Copy Bloodlines</button><button className="button button--outline" onClick={() => copy(currentMatch.missing.join('\n') || 'No tracked items missing')}><Clipboard size={15} /> Copy missing items</button></div>
      <div className="evidence-list">{build.evidence.map((item) => <article key={`${item.category}-${item.claim}`}><span>{item.category}</span><p><b>{item.claim}</b></p><small>{item.notes}</small></article>)}</div>
      {build.changeHistory.length > 0 && <div className="public-build-history"><h3>Build history</h3>{build.changeHistory.slice(-5).reverse().map((entry) => <p key={`${entry.date}-${entry.field}`}><b>{entry.date}</b> · {entry.field}: {entry.previousValue} → {entry.newValue}</p>)}</div>}
    </section>
  </main>
}

function LoadoutGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div className="loadout-group"><h2>{title}</h2><div>{children}</div></div>
}
function AssetFact({ label, name, type }: { label: string; name: string; type: ShindoAssetType }) {
  return <article><ShindoIcon name={name} type={type} size="medium" /><span>{label}</span><strong>{name}</strong></article>
}
function TextFact({ label, value }: { label: string; value: string }) {
  return <article className={value === 'None' || value.startsWith('None') ? 'is-empty' : ''}><span>{label}</span><strong>{value}</strong></article>
}
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <header className="build-section__heading"><span>{eyebrow}</span><h2>{title}</h2></header>
}
function ReasonCard({ title, value, reason }: { title: string; value: string; reason: string }) {
  return <article><span>{title}</span><h3>{value}</h3><p>{reason}</p></article>
}
function isEmptyMove(slot: HotbarSlot) {
  return /^(not used|none|no z-mode|unresolved)/i.test(slot.ability)
}
function MoveRow({ slot, expanded, onToggle }: { slot: HotbarSlot; expanded: boolean; onToggle: () => void }) {
  return <article className={`move-row ${isEmptyMove(slot) ? 'is-empty' : ''}`}>
    <button className="move-row__summary" onClick={onToggle} aria-expanded={expanded}><kbd>{slot.key}</kbd><ShindoIcon name={slot.source} size="medium" /><span><small>{slot.source}</small><strong>{slot.ability}</strong></span><span className="move-row__role">{slot.comboRole}</span><ChevronDown size={16} /></button>
    {expanded && <div className="move-row__details"><p><b>Character ability:</b> {slot.characterAbility ?? 'Editorial mapping not yet written.'}</p><p><b>Purpose:</b> {slot.purpose}</p><p><b>Source type:</b> {slot.sourceType ?? 'Needs review'} · <b>Accuracy:</b> {slot.accuracy ?? 'Unresolved'} · <b>Testing:</b> {slot.testingStatus ?? 'Needs Retesting'}</p><div className="tag-row">{slot.mobility && <span className="tag">Mobility</span>}{slot.counter && <span className="tag">Counter</span>}{(slot.guardPressure || slot.blockBreak) && <span className="tag">Guard pressure</span>}{slot.modeAbility && <span className="tag">Mode</span>}</div><small>{slot.usageNotes}</small>{slot.resourceNotes && <small>{slot.resourceNotes}</small>}</div>}
  </article>
}
function VariantComparison({ left, right, collection }: { left: BuildVariant; right: BuildVariant; collection: CollectionState }) {
  const leftMissing = inventoryMatch(left, collection).missing
  const rightMissing = inventoryMatch(right, collection).missing
  const rows: [string, string, string][] = [
    ['Bloodlines', left.bloodlines.map((item) => item.name).join(', '), right.bloodlines.map((item) => item.name).join(', ')],
    ['Elements', left.elements.map((item) => item.name).join(', '), right.elements.map((item) => item.name).join(', ')],
    ['Modes', `${left.cMode} / ${left.zMode}`, `${right.cMode} / ${right.zMode}`],
    ['Combat Art', left.combatArt, right.combatArt],
    ['Kenjutsu', variantKenjutsu(left), variantKenjutsu(right)],
    ['Weapon', left.weapon, right.weapon],
    ['Inventory gaps', leftMissing.join(', ') || 'None', rightMissing.join(', ') || 'None'],
    ['Accuracy', left.ratings.accuracy.toFixed(1), right.ratings.accuracy.toFixed(1)],
    ['PvP', left.ratings.pvp.toFixed(1), right.ratings.pvp.toFixed(1)],
    ['Mobility', left.ratings.mobility.toFixed(1), right.ratings.mobility.toFixed(1)],
    ['Defense', left.ratings.defense.toFixed(1), right.ratings.defense.toFixed(1)],
    ['Difficulty', left.ratings.difficulty.toFixed(1), right.ratings.difficulty.toFixed(1)],
  ]
  return <div className="variant-comparison"><header><span>Field</span><strong>{left.name}</strong><strong>{right.name}</strong></header>{rows.map(([label, a, b]) => <div className={a !== b ? 'is-different' : ''} key={label}><span>{label}</span><p>{a}</p><p>{b}</p></div>)}</div>
}
function BuildChecklist({ variant, collection }: { variant: BuildVariant; collection: CollectionState }) {
  const equipment = variantEquipment(variant)
  const items = [
    ...variant.bloodlines.map((slot) => ({ category: 'Bloodline', name: slot.name, owned: collection.statuses[slot.name] === 'Owned' })),
    ...variant.elements.map((slot) => ({ category: 'Element', name: slot.name, owned: collection.elementStatuses[slot.name] === 'Owned' })),
    ...[variant.cMode, variant.zMode].filter((name) => name !== 'None' && !/^No Z-mode/i.test(name)).map((name) => ({ category: 'Mode', name, owned: collection.modeStatuses[name.split(' — ')[0]] === 'Owned' })),
    ...[
      ['Combat Art', variant.combatArt],
      ['Kenjutsu', variantKenjutsu(variant)],
      ['Weapon', variant.weapon],
      ['Ninja tool', equipment.ninjaTool],
    ].filter(([, name]) => name !== 'None').map(([category, name]) => ({ category, name, owned: collection.equipmentStatuses[name] === 'Owned' })),
  ]
  return <div className="build-checklist"><h3>Build checklist</h3><div>{items.map((item) => <span className={item.owned ? 'is-owned' : ''} key={`${item.category}-${item.name}`}><i>{item.owned ? <Check size={12} /> : '—'}</i><b>{item.category}</b>{item.name}<em>{item.owned ? 'Owned' : 'Missing'}</em></span>)}</div></div>
}
