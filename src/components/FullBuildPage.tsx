import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  Clipboard,
  Link2,
  MessageCircleWarning,
  ShieldCheck,
  TestTube2,
} from "lucide-react";
import type { CharacterBuild, HotbarSlot } from "../types";
import type { CollectionState } from "../hooks/useBloodlineCollection";
import { shindoMoveById } from "../data/shindoGameData";
import { createConservativeProfile } from "../data/reviewedLegalProfiles";
import { validatePreparedHotbar } from "../lib/hotbarLegality";
import { Portrait } from "./Portrait";
import { ShindoIcon } from "./ShindoIcon";
import { readStorage, writeStorage } from "../services/storage";
import { portraitPresentation } from "../data/portraitPresentation";
import {
  BuildOverviewSection,
  VariantSelectorSection,
  BloodlineElementsSection,
  ModesSection,
  UtilitySection,
  EquipmentSection,
  StatsPlaystyleSection,
  HotbarSection,
  ComboSection,
  AlternativesSection,
  BuildAuditPanel,
  ResearchEvidenceSection,
} from "./build-sections";

const sectionNav = [
  ["section-overview", "Overview"],
  ["section-variants", "Variants"],
  ["section-bloodlines", "Bloodlines"],
  ["section-modes", "Modes"],
  ["section-utility", "Sub-Jutsu"],
  ["section-equipment", "Equipment"],
  ["section-stats", "Stats"],
  ["section-hotbar", "Hotbar"],
  ["section-combos", "Combos"],
  ["section-alternatives", "Alternatives"],
  ["section-legality", "Legality"],
  ["section-research", "Research"],
] as const;

function transitionUpdate(update: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => {
      ready: Promise<void>;
      updateCallbackDone: Promise<void>;
      finished: Promise<void>;
    };
  };
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !doc.startViewTransition
  )
    update();
  else {
    const t = doc.startViewTransition(update);
    void t.ready.catch(() => undefined);
    void t.updateCallbackDone.catch(() => undefined);
    void t.finished.catch(() => undefined);
  }
}

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
    build.variants.find((v) => v.type === "Primary") ?? build.variants[0];
  const initial =
    build.variants.find((v) => v.id === initialVariantId) ?? recommended;
  const [variantId, setVariantId] = useState(initial.id);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [hotbarView, setHotbarView] = useState<"game" | "technical">(() =>
    readStorage("shindo-build-archive:hotbar-view:v1", "game"),
  );
  const variant =
    build.variants.find((v) => v.id === variantId) ?? recommended;
  const profile = useMemo(() => createConservativeProfile(variant), [variant]);
  const legality = useMemo(
    () => validatePreparedHotbar(variant, profile),
    [profile, variant],
  );
  const selectedMove = selectedMoveId
    ? shindoMoveById.get(selectedMoveId)
    : undefined;
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
    const found = build.variants.find((v) => v.id === initialVariantId);
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
          <Portrait
            src={build.image}
            alt={build.name}
            objectPosition={presentation.heroPosition}
          />
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
              <b>Hotbar legality: </b>
              {legality.status}
            </span>
            <span>
              <b>Research confidence: </b>
              {build.confidence}
            </span>
            <span>
              <TestTube2 size={14} />
              <b>Testing: </b>
              {variant.ownerTestingStatus ?? "Not tested"}
            </span>
            <span>
              <b>Accuracy: </b>
              {variant.ratings.accuracy.toFixed(1)} / 10
            </span>
          </div>
          <p className="dossier-update">
            <b>
              Target update: {variant.researchedGameVersion ?? "249/249.5"}
            </b>
            <span>Official mechanic confirmation pending</span>
          </p>
          <label className="dossier-profile-picker">
            Selected profile
            <select
              value={variant.id}
              onChange={(e) => selectVariant(e.target.value)}
            >
              {build.variants.map((v) => (
                <option value={v.id} key={v.id}>
                  {v.name} · {v.bloodlineSlotCount}×{v.elementSlotCount}
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

      <nav className="dossier-section-nav" aria-label="Build sections">
        {sectionNav.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById(id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="dossier-sections">
        <BuildOverviewSection
          build={build}
          variant={variant}
          legalityStatus={legality.status}
        />
        <VariantSelectorSection
          build={build}
          variant={variant}
          collection={collection}
          onSelect={selectVariant}
        />
        <BloodlineElementsSection variant={variant} />
        <ModesSection variant={variant} />
        <UtilitySection variant={variant} />
        <EquipmentSection variant={variant} />
        <StatsPlaystyleSection variant={variant} />
        <HotbarSection
          variant={variant}
          hotbarView={hotbarView}
          onHotbarViewChange={setHotbarView}
          selectedMoveId={selectedMoveId}
          onSelectMove={setSelectedMoveId}
          onCopyHotbar={() =>
            copy(
              variant.hotbar
                .map((s) => `${s.key} — ${s.ability}`)
                .join("\n"),
              "Loadout",
            )
          }
        />
        {selectedMove && (
          <MoveInspector
            moveId={selectedMove.id}
            slot={variant.hotbar.find(
              (s) => s.canonicalMoveId === selectedMove.id,
            )}
            onReport={() =>
              onReportIssue(`${variant.name} · ${selectedMove.name}`)
            }
          />
        )}
        <ComboSection variant={variant} />
        <div className="section-actions">
          <button
            className="button button--outline"
            onClick={() =>
              copy(
                variant.combos
                  .map((c) => `${c.name}: ${c.sequence.join(" → ")}`)
                  .join("\n"),
                "Routes",
              )
            }
          >
            <Clipboard size={15} /> Copy routes
          </button>
        </div>
        <AlternativesSection
          build={build}
          variant={variant}
          collection={collection}
          onSelectVariant={selectVariant}
        />
        <BuildAuditPanel variant={variant} legalityIssues={legality.issues} />
        <ResearchEvidenceSection build={build} variant={variant} />
        <button
          className="button button--outline"
          onClick={() =>
            onReportIssue(`${variant.name} · general mechanic issue`)
          }
        >
          <MessageCircleWarning size={15} /> Report incorrect mechanic
        </button>
      </div>
    </main>
  );
}

function HeroLoadoutSnapshot({
  variant,
}: {
  variant: import("../types").BuildVariant;
}) {
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
    ([, v]) => v === true,
  );
  const unverifiedMechanics = Object.values(move.mechanics).filter(
    (v) => v === "Unverified",
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
