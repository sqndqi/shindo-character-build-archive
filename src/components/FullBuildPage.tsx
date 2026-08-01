import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  Check,
  Clipboard,
  Link2,
  MessageCircleWarning,
  PackageCheck,
  ShieldCheck,
  TestTube2,
} from "lucide-react";
import type { BuildVariant, CharacterBuild, HotbarSlot } from "../types";
import type { CollectionState } from "../hooks/useBloodlineCollection";
import type { HotbarKey } from "../types/shindoGame";
import { shindoMoveById, shindoMoves } from "../data/shindoGameData";
import { createConservativeProfile } from "../data/reviewedLegalProfiles";
import { validatePreparedHotbar } from "../lib/hotbarLegality";
import {
  closestPreparedVariant,
  inventoryMatch,
  variantEquipment,
  variantKenjutsu,
} from "../lib/variants";
import { Portrait } from "./Portrait";
import { ShindoIcon } from "./ShindoIcon";
import { GameHotbarPreview } from "./GameHotbarPreview";
import { readStorage, writeStorage } from "../services/storage";
import { portraitPresentation } from "../data/portraitPresentation";

const views = [
  ["build", "Build"],
  ["techniques", "Techniques"],
  ["alternatives", "Alternatives"],
  ["research", "Research"],
] as const;

function transitionUpdate(update: () => void) {
  const documentWithTransitions = document as Document & {
    startViewTransition?: (callback: () => void) => {
      ready: Promise<void>;
      updateCallbackDone: Promise<void>;
      finished: Promise<void>;
    };
  };
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !documentWithTransitions.startViewTransition
  )
    update();
  else {
    const transition = documentWithTransitions.startViewTransition(update);
    void transition.ready.catch(() => undefined);
    void transition.updateCallbackDone.catch(() => undefined);
    void transition.finished.catch(() => undefined);
  }
}

type DossierView = (typeof views)[number][0];

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
  onNotify,
}: {
  build: CharacterBuild;
  initialVariantId?: string;
  collection: CollectionState;
  variantFavorites: string[];
  watchlist: string[];
  onBack: () => void;
  onVariantRoute: (variantId: string) => void;
  onFavoriteVariant: (variantId: string) => void;
  onWatch: (buildId: string) => void;
  onReportIssue: (variant: string) => void;
  onViewed: (buildId: string) => void;
  onNotify: (message: string) => void;
}) {
  const recommended =
    build.variants.find((item) => item.type === "Primary") ?? build.variants[0];
  const initial =
    build.variants.find((item) => item.id === initialVariantId) ?? recommended;
  const [variantId, setVariantId] = useState(initial.id);
  const [activeView, setActiveView] = useState<DossierView>("build");
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState("");
  const [hotbarView, setHotbarView] = useState<"game" | "technical">(() =>
    readStorage("shindo-build-archive:hotbar-view:v1", "game"),
  );
  const variant =
    build.variants.find((item) => item.id === variantId) ?? recommended;
  const profile = useMemo(() => createConservativeProfile(variant), [variant]);
  const legality = useMemo(
    () => validatePreparedHotbar(variant, profile),
    [profile, variant],
  );
  const recommendedMatch = useMemo(
    () => inventoryMatch(recommended, collection),
    [collection, recommended],
  );
  const closest = useMemo(
    () => closestPreparedVariant(build.variants, collection),
    [build.variants, collection],
  );
  const compare = build.variants.find((item) => item.id === compareId);
  const qSlot = variant.hotbar.find((slot) => slot.key === "Q");
  const selectedMove = selectedMoveId
    ? shindoMoveById.get(selectedMoveId)
    : undefined;
  const equippedMoveIds = new Set(
    variant.hotbar.map((slot) => slot.canonicalMoveId).filter(Boolean),
  );
  const moveBank = variant.moveBankPlan
    ? variant.moveBankPlan
        .map((entry) => ({
          move: shindoMoveById.get(entry.moveId),
          plan: entry,
        }))
        .filter((entry) => entry.move)
    : shindoMoves
        .filter(
          (move) =>
            move.sourceType === "Bloodline" &&
            variant.bloodlines.some(
              (source) => source.name === move.sourceName,
            ) &&
            !equippedMoveIds.has(move.id),
        )
        .map((move) => ({ move, plan: undefined }));
  const accent = accentFor(build);
  const presentation = portraitPresentation(build.id);
  const heroStyle = {
    "--dossier-aura": `url("${build.thumbnail || build.image}")`,
    "--hero-portrait-position": presentation.heroPosition,
    "--hero-portrait-scale": presentation.heroScale,
  } as CSSProperties;

  useEffect(() => {
    onViewed(build.id);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [build.id, onViewed]);
  useEffect(() => {
    const found = build.variants.find((item) => item.id === initialVariantId);
    if (found) setVariantId(found.id);
  }, [build.variants, initialVariantId]);
  useEffect(() => {
    writeStorage("shindo-build-archive:hotbar-view:v1", hotbarView);
  }, [hotbarView]);

  const selectVariant = (id: string) => {
    transitionUpdate(() => {
      setVariantId(id);
      setSelectedMoveId(null);
      onVariantRoute(id);
    });
  };
  const copy = (text: string, label: string) =>
    navigator.clipboard.writeText(text).then(() => onNotify(`${label} copied`));

  return (
    <main
      className={`full-build-page ninja-dossier accent-${accent}`}
      style={heroStyle}
    >
      <button className="build-back button button--text" onClick={onBack}>
        <ArrowLeft size={17} /> Back to archive
      </button>

      <header className="dossier-hero">
        <div className="dossier-hero__portrait">
          <Portrait src={build.image} alt={build.name} />
        </div>
        <div className="dossier-hero__content">
          <p className="eyebrow">
            {build.series} · {build.version}
          </p>
          <div className="dossier-title-row">
            <h1>{build.name}</h1>
            <div className="dossier-hero__actions">
              <button
                className={`button button--outline ${variantFavorites.includes(variant.id) ? "is-active" : ""}`}
                onClick={() => onFavoriteVariant(variant.id)}
              >
                <Bookmark
                  size={15}
                  fill={
                    variantFavorites.includes(variant.id)
                      ? "currentColor"
                      : "none"
                  }
                />{" "}
                Bookmark
              </button>
              <button
                className={`button button--outline ${watchlist.includes(build.id) ? "is-active" : ""}`}
                onClick={() => onWatch(build.id)}
              >
                <Bell size={15} />{" "}
                {watchlist.includes(build.id) ? "Watching" : "Watch"}
              </button>
              <button
                className="button button--outline"
                onClick={() => copy(window.location.href, "Build link")}
              >
                <Link2 size={15} /> Copy link
              </button>
            </div>
          </div>
          <p className="dossier-identity">{build.archetype.join(" · ")}</p>
          <p>{build.description}</p>
          <div className="dossier-status">
            <span
              className={`legality-badge legality-badge--${legality.status.toLowerCase().replaceAll(" ", "-")}`}
            >
              <ShieldCheck size={14} />
              <b>Hotbar legality</b>
              {legality.status}
            </span>
            <span>
              <b>Research confidence</b>
              {build.confidence}
            </span>
            <span>
              <TestTube2 size={14} />
              <b>Live testing status</b>
              {variant.ownerTestingStatus ?? "Not tested"}
            </span>
            <span>
              <b>Character accuracy</b>
              {variant.ratings.accuracy.toFixed(1)} / 10
            </span>
          </div>
          <p className="dossier-update">
            <b>Target update: {variant.researchedGameVersion ?? "249/249.5"}</b>
            <span>Official mechanic confirmation pending</span>
          </p>
          <label className="dossier-profile-picker">
            Selected profile
            <select
              value={variant.id}
              onChange={(event) => selectVariant(event.target.value)}
            >
              {build.variants.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name} · {item.bloodlineSlotCount}×
                  {item.elementSlotCount}
                </option>
              ))}
            </select>
          </label>
          <HeroLoadoutSnapshot variant={variant} />
        </div>
      </header>

      {build.publicationStatus !== "Reviewed" && (
        <aside className="draft-notice">
          <strong>{build.publicationStatus}</strong>
          <span>
            This early draft keeps its concept data, but its exact hotbar is not
            presented as researched or game legal.
          </span>
        </aside>
      )}

      <LoadoutRibbon variant={variant} />

      <nav className="dossier-nav" aria-label="Build dossier views">
        {views.map(([id, label]) => (
          <button
            key={id}
            className={activeView === id ? "is-active" : ""}
            onClick={() => transitionUpdate(() => setActiveView(id))}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeView === "build" && (
        <section className="dossier-view">
          <div className="hotbar-heading-row">
            <SectionHeading
              eyebrow="Equipped controls"
              title="Playable hotbar"
              text="Game view follows the owner HUD reference; Technical view preserves canonical archive keys and legality."
            />
            <div
              className="hotbar-view-toggle"
              role="group"
              aria-label="Hotbar display mode"
            >
              <button
                className={hotbarView === "game" ? "is-active" : ""}
                onClick={() => setHotbarView("game")}
              >
                Game view
              </button>
              <button
                className={hotbarView === "technical" ? "is-active" : ""}
                onClick={() => setHotbarView("technical")}
              >
                Technical view
              </button>
            </div>
          </div>
          {hotbarView === "game" ? (
            <GameHotbarPreview
              hotbar={variant.hotbar}
              selectedMoveId={selectedMoveId}
              onSelect={setSelectedMoveId}
            />
          ) : (
            <HotbarDossier
              hotbar={variant.hotbar}
              selectedMoveId={selectedMoveId}
              onSelect={setSelectedMoveId}
            />
          )}
          {selectedMove && (
            <MoveInspector
              moveId={selectedMove.id}
              slot={variant.hotbar.find(
                (item) => item.canonicalMoveId === selectedMove.id,
              )}
              onReport={() =>
                onReportIssue(`${variant.name} · ${selectedMove.name}`)
              }
            />
          )}
          <div className="dossier-usage">
            <article>
              <h3>Quick usage</h3>
              <ul>
                {variant.usageGuide.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Strengths</h3>
              <ul>
                {variant.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Weaknesses</h3>
              <ul>
                {variant.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
          <div className="section-actions">
            <button
              className="button button--outline"
              onClick={() =>
                copy(
                  variant.hotbar
                    .map((slot) => `${slot.key} — ${slot.ability}`)
                    .join("\n"),
                  "Loadout",
                )
              }
            >
              <Clipboard size={15} /> Copy hotbar
            </button>
            <button
              className="button button--outline"
              onClick={() =>
                copy(
                  variant.combos
                    .map(
                      (combo) => `${combo.name}: ${combo.sequence.join(" → ")}`,
                    )
                    .join("\n"),
                  "Routes",
                )
              }
            >
              <Clipboard size={15} /> Copy routes
            </button>
          </div>
        </section>
      )}

      {activeView === "techniques" && (
        <section className="dossier-view">
          <SectionHeading
            eyebrow="Technique inventory"
            title="Equipped moves and move bank"
            text="The move bank contains available but unequipped Bloodline moves. It is not part of the active hotbar."
          />
          <div className="technique-columns">
            <div>
              <h3>Equipped techniques</h3>
              <div className="technique-list">
                {variant.hotbar
                  .filter((slot) => slot.canonicalMoveId)
                  .map((slot) => (
                    <TechniqueButton
                      key={slot.id}
                      slot={slot}
                      onSelect={setSelectedMoveId}
                    />
                  ))}
              </div>
            </div>
            <div>
              <h3>Move bank</h3>
              {moveBank.length === 0 ? (
                <p className="move-bank__empty">
                  No prepared swap is attached to this profile. Unequipped
                  abilities are not part of the active build.
                </p>
              ) : (
                <div className="move-bank">
                  {moveBank.map(
                    ({ move, plan }) =>
                      move && (
                        <button
                          key={move.id}
                          onClick={() => setSelectedMoveId(move.id)}
                        >
                          <ShindoIcon name={move.sourceName} size="medium" />
                          <span>
                            <b>{move.name}</b>
                            <small>
                              {move.sourceName} · replaces{" "}
                              {plan?.replacesKey ??
                                "an equipped Bloodline move"}
                            </small>
                            {plan && (
                              <em>
                                {plan.situation} · {plan.accuracy} ·{" "}
                                {plan.liveTested
                                  ? "Owner tested"
                                  : "Not live tested"}
                              </em>
                            )}
                          </span>
                        </button>
                      ),
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mode-q-strip">
            <AssetFact label="C-mode" name={variant.cMode} type="Mode" />
            <AssetFact label="Z-mode" name={variant.zMode} type="Mode" />
            <TextFact
              label="Q action"
              value={
                qSlot?.sourceType === "None"
                  ? (qSlot.emptyReason ?? "Intentionally unused")
                  : `${qSlot?.source}: ${qSlot?.ability}`
              }
            />
          </div>
          {selectedMove && (
            <MoveInspector
              moveId={selectedMove.id}
              slot={variant.hotbar.find(
                (item) => item.canonicalMoveId === selectedMove.id,
              )}
              onReport={() =>
                onReportIssue(`${variant.name} · ${selectedMove.name}`)
              }
            />
          )}
        </section>
      )}

      {activeView === "alternatives" && (
        <section className="dossier-view">
          <SectionHeading
            eyebrow="Prepared profiles"
            title="Inventory-compatible alternatives"
            text="Only authored profiles are considered. The archive does not generate a new build from your collection."
          />
          <div className="inventory-recommendation">
            <PackageCheck size={24} />
            <div>
              <span>Recommended</span>
              <strong>{recommended.name}</strong>
              <p>
                {recommendedMatch.missing.length
                  ? `Missing: ${recommendedMatch.missing.join(", ")}`
                  : "Complete from your inventory."}
              </p>
            </div>
            <div>
              <span>Closest prepared profile</span>
              <strong>{closest.variant.name}</strong>
              <p>
                {closest.missing.length
                  ? `${closest.missing.length} tracked item(s) missing`
                  : "Complete from your inventory"}
              </p>
            </div>
            <button
              className="button button--primary"
              onClick={() => selectVariant(closest.variant.id)}
            >
              Use my inventory
            </button>
          </div>
          <BuildChecklist variant={variant} collection={collection} />
          <div className="variant-card-grid">
            {build.variants.map((item) => {
              const match = inventoryMatch(item, collection);
              return (
                <button
                  key={item.id}
                  className={item.id === variant.id ? "is-active" : ""}
                  onClick={() => selectVariant(item.id)}
                >
                  <span>{item.type}</span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.hotbarLegalityStatus ?? "Research pending"} ·{" "}
                    {match.missing.length
                      ? `${match.missing.length} missing`
                      : "Ready"}
                  </small>
                </button>
              );
            })}
          </div>
          <label className="variant-compare-picker">
            Compare current variant with
            <select
              value={compareId}
              onChange={(event) => setCompareId(event.target.value)}
            >
              <option value="">Choose another profile</option>
              {build.variants
                .filter((item) => item.id !== variant.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </label>
          {compare && (
            <VariantComparison
              left={variant}
              right={compare}
              collection={collection}
            />
          )}
        </section>
      )}

      {activeView === "research" && (
        <section className="dossier-view">
          <SectionHeading
            eyebrow="Research record"
            title="What is known—and what is not"
            text="Structural placement can be validated without pretending combat timing or guard behavior has been live-tested."
          />
          <div className="research-ledger">
            <article>
              <span>Hotbar legality</span>
              <strong>{legality.status}</strong>
              <p>
                {legality.issues.length
                  ? `${legality.issues.length} remaining structural warning(s).`
                  : "No structural placement errors found."}
              </p>
            </article>
            <article>
              <span>Owner testing</span>
              <strong>{variant.ownerTestingStatus ?? "Not tested"}</strong>
              <p>
                Schema checks do not prove live combo timing, cooldowns, or
                guard behavior.
              </p>
            </article>
            <article>
              <span>Character confidence</span>
              <strong>{build.confidence}</strong>
              <p>
                {(variant.compromises?.length
                  ? variant.compromises
                  : build.knownCompromises
                ).join(" ")}
              </p>
            </article>
          </div>
          {legality.issues.length > 0 && (
            <ul className="legality-issues">
              {legality.issues.map((item, index) => (
                <li key={`${item.code}-${index}`}>
                  <b>{item.severity}</b>
                  {item.message}
                </li>
              ))}
            </ul>
          )}
          {Object.keys(profile.carriedSourceReasons).length > 0 && (
            <div className="carried-source-reasons">
              <h3>Equipped sources without an active move</h3>
              <p>
                Each retained source below has a concrete profile-specific
                purpose. It does not occupy V, B, or N in this setup.
              </p>
              {Object.entries(profile.carriedSourceReasons).map(
                ([source, reason]) => (
                  <article key={source}>
                    <ShindoIcon name={source} size="medium" />
                    <div>
                      <strong>{source}</strong>
                      <span>{reason}</span>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
          <div className="evidence-list">
            {build.evidence.map((item) => (
              <article key={`${item.category}-${item.claim}`}>
                <span>{item.category}</span>
                <p>
                  <b>{item.claim}</b>
                </p>
                <small>{item.notes}</small>
              </article>
            ))}
          </div>
          <button
            className="button button--outline"
            onClick={() =>
              onReportIssue(`${variant.name} · general mechanic issue`)
            }
          >
            <MessageCircleWarning size={15} /> Report incorrect mechanic
          </button>
        </section>
      )}
    </main>
  );
}

function LoadoutRibbon({ variant }: { variant: BuildVariant }) {
  const equipment = variantEquipment(variant);
  return (
    <section className="loadout-ribbon" aria-label="Primary loadout">
      <div className="loadout-ribbon__header">
        <span>Primary loadout</span>
        <strong>{variant.name}</strong>
        <em>
          {variant.bloodlineSlotCount} Bloodline · {variant.elementSlotCount}{" "}
          element slots
        </em>
      </div>
      <div className="loadout-ribbon__assets">
        <LoadoutCluster label="Bloodlines">
          {variant.bloodlines.map((slot) => (
            <AssetFact
              key={slot.name}
              label={slot.useMode ? "Mode source" : "Equipped"}
              name={slot.name}
              type="Bloodline"
            />
          ))}
        </LoadoutCluster>
        <LoadoutCluster label="Elements">
          {variant.elements.map((slot) => (
            <AssetFact
              key={slot.name}
              label="Equipped"
              name={slot.name}
              type="Element"
            />
          ))}
        </LoadoutCluster>
      </div>
      <div className="loadout-ribbon__systems">
        <AssetFact label="C-mode" name={variant.cMode} type="Mode" />
        <AssetFact label="Z-mode" name={variant.zMode} type="Mode" />
        <TextFact label="Combat Art" value={variant.combatArt} />
        <TextFact label="Kenjutsu" value={variantKenjutsu(variant)} />
        <TextFact label="Weapon" value={variant.weapon} />
        <TextFact label="Ninja tool" value={equipment.ninjaTool} />
        <TextFact label="Consumable" value={equipment.consumable} />
        <TextFact label="Mentor" value={equipment.mentor} />
        <TextFact label="Race" value={equipment.race} />
      </div>
    </section>
  );
}

function HeroLoadoutSnapshot({ variant }: { variant: BuildVariant }) {
  return (
    <div
      className="hero-loadout-snapshot"
      aria-label="Immediate loadout snapshot"
    >
      <div>
        {variant.bloodlines.map((slot) => (
          <span key={slot.name}>
            <ShindoIcon name={slot.name} type="Bloodline" size="medium" />
            <b>{slot.name}</b>
          </span>
        ))}
      </div>
      <p>
        <strong>{variant.cMode}</strong>
        <span>
          {variant.combatArt}
          {variant.kenjutsu && variant.kenjutsu !== "None"
            ? ` · ${variant.kenjutsu}`
            : ""}
          {variant.weapon !== "None" ? ` · ${variant.weapon}` : ""}
        </span>
      </p>
    </div>
  );
}

function HotbarDossier({
  hotbar,
  selectedMoveId,
  onSelect,
}: {
  hotbar: HotbarSlot[];
  selectedMoveId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const rows: [string, HotbarKey[]][] = [
    ["General / element row", ["1", "2", "3", "4", "5", "T"]],
    ["Bloodline row", ["V", "B", "N"]],
    ["Modes and Q", ["C", "Z", "Q"]],
  ];
  return (
    <div className="dossier-hotbar">
      {rows.map(([label, keys]) => (
        <div
          className={`dossier-hotbar__row row-${keys[0].toLowerCase()}`}
          key={label}
        >
          <span>{label}</span>
          <div>
            {keys.map((key) => {
              const slot = hotbar.find((item) => item.key === key)!;
              const empty = !slot.canonicalMoveId;
              return (
                <button
                  key={key}
                  className={`${empty ? "is-empty" : ""} ${selectedMoveId === slot.canonicalMoveId ? "is-active" : ""}`}
                  onClick={() => onSelect(slot.canonicalMoveId ?? null)}
                  disabled={empty}
                >
                  <kbd>{key}</kbd>
                  {!empty && <ShindoIcon name={slot.source} size="large" />}
                  <strong>{slot.ability}</strong>
                  <small>
                    {empty
                      ? slot.usageNotes
                      : `${slot.source} · ${slot.comboRole}`}
                  </small>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MoveInspector({
  moveId,
  slot,
  onReport,
}: {
  moveId: string;
  slot?: HotbarSlot;
  onReport: () => void;
}) {
  const move = shindoMoveById.get(moveId);
  if (!move) return null;
  const confirmedMechanics = Object.entries(move.mechanics).filter(
    ([, value]) => value === true,
  );
  const unverifiedMechanics = Object.values(move.mechanics).filter(
    (value) => value === "Unverified",
  ).length;
  return (
    <aside className="move-inspector">
      <div className="move-inspector__icon">
        <ShindoIcon name={move.sourceName} size="large" />
      </div>
      <div>
        <span>
          {move.sourceType} · {move.placement.category}
        </span>
        <h3>{move.name}</h3>
        <p>
          {slot?.characterAbility ??
            "Character mapping still needs an individually authored note."}
        </p>
        <div className="mechanic-grid">
          {confirmedMechanics.map(([name]) => (
            <span key={name} className="is-confirmed">
              <b>{labelize(name)}</b>Research-supported
            </span>
          ))}
          {unverifiedMechanics > 0 && (
            <span>
              <b>{unverifiedMechanics} mechanics</b>Awaiting corroboration
            </span>
          )}
        </div>
        <p>
          <b>Placement:</b> {move.placement.allowedKeys.join(", ")}.{" "}
          {move.placement.flexiblePlacement
            ? "Flexible placement has supporting evidence."
            : "No flexible placement is claimed."}
        </p>
        <p>
          <b>Resources:</b> not published until independently corroborated.
        </p>
      </div>
      <button className="button button--text" onClick={onReport}>
        <MessageCircleWarning size={15} /> Report this mechanic
      </button>
    </aside>
  );
}

function TechniqueButton({
  slot,
  onSelect,
}: {
  slot: HotbarSlot;
  onSelect: (id: string) => void;
}) {
  return (
    <button onClick={() => onSelect(slot.canonicalMoveId!)}>
      <kbd>{slot.key}</kbd>
      <ShindoIcon name={slot.source} size="medium" />
      <span>
        <b>{slot.ability}</b>
        <small>
          {slot.source} · {slot.comboRole}
        </small>
      </span>
    </button>
  );
}

function LoadoutCluster({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="loadout-cluster">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}
function AssetFact({
  label,
  name,
  type,
}: {
  label: string;
  name: string;
  type: "Bloodline" | "Element" | "Mode";
}) {
  const empty = /^(none|no z-mode)/i.test(name);
  return (
    <article className={empty ? "is-empty" : ""}>
      {!empty && (
        <ShindoIcon name={name.split(" — ")[0]} type={type} size="medium" />
      )}
      <span>{label}</span>
      <strong>{name}</strong>
    </article>
  );
}
function TextFact({ label, value }: { label: string; value: string }) {
  return (
    <article className={`text-fact ${value === "None" ? "is-empty" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <header className="dossier-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </header>
  );
}
function BuildChecklist({
  variant,
  collection,
}: {
  variant: BuildVariant;
  collection: CollectionState;
}) {
  const items = [
    ...variant.bloodlines.map(
      (item) =>
        [
          "Bloodline",
          item.name,
          collection.statuses[item.name] === "Owned",
        ] as const,
    ),
    ...variant.elements.map(
      (item) =>
        [
          "Element",
          item.name,
          collection.elementStatuses[item.name] === "Owned",
        ] as const,
    ),
  ];
  return (
    <div className="build-checklist">
      <h3>Build checklist</h3>
      <div>
        {items.map(([category, name, owned]) => (
          <span className={owned ? "is-owned" : ""} key={`${category}-${name}`}>
            <i>{owned ? <Check size={12} /> : "—"}</i>
            <b>{category}</b>
            {name}
            <em>{owned ? "Owned" : "Missing"}</em>
          </span>
        ))}
      </div>
    </div>
  );
}
function VariantComparison({
  left,
  right,
  collection,
}: {
  left: BuildVariant;
  right: BuildVariant;
  collection: CollectionState;
}) {
  const rows = [
    [
      "Bloodlines",
      left.bloodlines.map((item) => item.name).join(", "),
      right.bloodlines.map((item) => item.name).join(", "),
    ],
    [
      "Elements",
      left.elements.map((item) => item.name).join(", "),
      right.elements.map((item) => item.name).join(", "),
    ],
    [
      "Modes",
      `${left.cMode} / ${left.zMode}`,
      `${right.cMode} / ${right.zMode}`,
    ],
    ["Weapon", left.weapon, right.weapon],
    [
      "Inventory gaps",
      inventoryMatch(left, collection).missing.join(", ") || "None",
      inventoryMatch(right, collection).missing.join(", ") || "None",
    ],
    [
      "Accuracy",
      left.ratings.accuracy.toFixed(1),
      right.ratings.accuracy.toFixed(1),
    ],
    ["PvP", left.ratings.pvp.toFixed(1), right.ratings.pvp.toFixed(1)],
  ];
  return (
    <div className="variant-comparison">
      <header>
        <span>Field</span>
        <strong>{left.name}</strong>
        <strong>{right.name}</strong>
      </header>
      {rows.map(([label, a, b]) => (
        <div className={a !== b ? "is-different" : ""} key={label}>
          <span>{label}</span>
          <p>{a}</p>
          <p>{b}</p>
        </div>
      ))}
    </div>
  );
}
function accentFor(build: CharacterBuild) {
  const text =
    `${build.archetype.join(" ")} ${build.combatTags.join(" ")}`.toLowerCase();
  if (/weapon|sword|kenjutsu/.test(text)) return "weapon";
  if (/lightning/.test(text)) return "lightning";
  if (/shadow/.test(text)) return "shadow";
  if (/counter|prediction/.test(text)) return "counter";
  if (/power|strength|durability/.test(text)) return "power";
  if (/speed|mobility/.test(text)) return "speed";
  return "technique";
}
function labelize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}
