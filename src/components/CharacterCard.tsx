import { memo, type CSSProperties } from "react";
import { ArrowUpRight, Check, Heart, Lock, Sparkles, Swords, Unlock } from "lucide-react";
import type { CharacterBuild, SlotLimit } from "../types";
import { Portrait } from "./Portrait";
import { ShindoIcon } from "./ShindoIcon";
import { preparedVariantLabels, variantKenjutsu } from "../lib/variants";
import { portraitPresentation } from "../data/portraitPresentation";
import type { ArchiveBuildRecord } from "../types/archiveAccess";

type Props = {
  build: CharacterBuild;
  slotLimit: SlotLimit;
  selected: boolean;
  favorite: boolean;
  comparisonDisabled: boolean;
  onOpen: (build: CharacterBuild) => void;
  onUnlock: (id: string) => void;
  onCompare: (id: string) => void;
  onFavorite: (id: string) => void;
  mode: "compact" | "visual";
};

const accessIcon = {
  Free: Unlock,
  Locked: Lock,
  Selected: Sparkles,
  Owned: Check,
} as const;

function AccessSeal({ access }: { access: keyof typeof accessIcon }) {
  const Icon = accessIcon[access];
  return (
    <span className={`access-seal access-seal--${access.toLowerCase()}`}>
      <Icon size={11} aria-hidden="true" />
      {access}
    </span>
  );
}

export const CharacterCard = memo(function CharacterCard({
  build,
  slotLimit,
  selected,
  favorite,
  comparisonDisabled,
  onOpen,
  onUnlock,
  onCompare,
  onFavorite,
  mode,
}: Props) {
  const access = (build as ArchiveBuildRecord).accessState ?? "Owned";
  const locked = access === "Locked" || access === "Selected";
  if (locked)
    return (
      <article
        className={`character-card character-card--${mode} character-card--locked is-${access.toLowerCase()}`}
        style={
          {
            "--card-portrait-position": portraitPresentation(build.id)
              .cardPosition,
          } as CSSProperties
        }
      >
        <div className="character-card__visual">
          <Portrait
            src={build.thumbnail || build.image}
            alt={build.name}
            thumbnail
          />
          <div className="character-card__scrim" />
          <AccessSeal access={access} />
          <button
            className={`favorite-toggle ${favorite ? "is-favorite" : ""}`}
            onClick={() => onFavorite(build.id)}
            aria-label={`${favorite ? "Remove" : "Add"} ${build.name} ${favorite ? "from" : "to"} favorites`}
          >
            <Heart size={15} fill={favorite ? "currentColor" : "none"} />
          </button>
          <div className="character-card__identity">
            <span>{build.series}</span>
            <h3>{build.name}</h3>
            <p>{build.version}</p>
          </div>
        </div>
        <div className="locked-build-summary">
          <div className="chakra-chain chakra-chain--one" />
          <div className="chakra-chain chakra-chain--two" />
          <div className="chakra-seal" aria-hidden="true">
            <i>?</i>
          </div>
          <p>{build.archetype.slice(0, 3).join(" · ")}</p>
          <span>
            {(build as ArchiveBuildRecord).publicVariantCount} prepared variant
            {(build as ArchiveBuildRecord).publicVariantCount === 1 ? "" : "s"}
          </span>
          <div className="locked-slot-row" aria-label="Locked loadout slots">
            <i>?</i>
            <i>?</i>
            <i>?</i>
            <i>?</i>
          </div>
          <button
            className="button button--primary"
            onClick={() => onUnlock(build.id)}
          >
            {access === "Selected"
              ? "Selected for pack"
              : "Unlock in a character pack"}
          </button>
        </div>
      </article>
    );
  const variant =
    build.variants.find((item) => item.bloodlineSlotCount === slotLimit) ??
    build.variants[0];
  const prepared = preparedVariantLabels(build.variants);
  const presentation = portraitPresentation(build.id);
  return (
    <article
      className={`character-card character-card--${mode}`}
      style={
        {
          "--card-portrait-position": presentation.cardPosition,
          "--card-portrait-scale": presentation.cardScale,
        } as CSSProperties
      }
    >
      <div className="character-card__visual">
        <Portrait
          src={build.thumbnail || build.image}
          alt={build.name}
          thumbnail
        />
        <div className="character-card__scrim" />
        <AccessSeal access={access} />
        <span
          className={`status-badge status-badge--${build.publicationStatus.toLowerCase().replace(" ", "-")}`}
        >
          {variant.hotbarLegalityStatus === "Game Legal"
            ? "Hotbar: Game Legal"
            : build.publicationStatus}
        </span>
        <button
          className={`compare-toggle ${selected ? "is-selected" : ""}`}
          onClick={() => onCompare(build.id)}
          disabled={comparisonDisabled && !selected}
          aria-label={`${selected ? "Remove" : "Add"} ${build.name} ${selected ? "from" : "to"} comparison`}
        >
          {selected ? <Check size={15} /> : <Swords size={15} />}
        </button>
        <button
          className={`favorite-toggle ${favorite ? "is-favorite" : ""}`}
          onClick={() => onFavorite(build.id)}
          aria-label={`${favorite ? "Remove" : "Add"} ${build.name} ${favorite ? "from" : "to"} favorites`}
        >
          <Heart size={15} fill={favorite ? "currentColor" : "none"} />
        </button>
        <div className="character-card__identity">
          <span>
            {build.series}
            {build.media === "Manga / Anime" ? " · Manga / Anime" : ""}
          </span>
          <h3 title={build.name}>{build.name}</h3>
          <p>{build.version}</p>
        </div>
      </div>
      <div className="character-card__body">
        <div className="card-primary-bloodline">
          <ShindoIcon
            name={variant.bloodlines[0]?.name ?? "Unresolved"}
            type="Bloodline"
            size="large"
            eager
          />
          <div>
            <span>Main identity</span>
            <strong>{variant.bloodlines[0]?.name ?? "Unresolved"}</strong>
            <small>{build.archetype.slice(0, 2).join(" · ")}</small>
          </div>
        </div>
        <div className="card-icon-row" aria-label="Supporting Bloodlines">
          {variant.bloodlines.slice(1).map((slot) => (
            <ShindoIcon
              key={slot.name}
              name={slot.name}
              type="Bloodline"
              size="small"
            />
          ))}
        </div>
        <div className="card-build-line">
          <span>Elements</span>
          <strong className="inline-assets">
            {variant.elements.map((slot) => (
              <ShindoIcon
                key={slot.name}
                name={slot.name}
                type="Element"
                size="small"
                showLabel
              />
            ))}
          </strong>
        </div>
        <div className="card-build-line">
          <span>Main mode</span>
          <strong>{variant.cMode}</strong>
        </div>
        <div className="card-build-line">
          <span>Combat Art</span>
          <strong>{variant.combatArt}</strong>
        </div>
        {variantKenjutsu(variant) !== "None" && (
          <div className="card-build-line">
            <span>Kenjutsu</span>
            <strong>{variantKenjutsu(variant)}</strong>
          </div>
        )}
        {variant.weapon !== "None" && (
          <div className="card-build-line">
            <span>Weapon</span>
            <strong>{variant.weapon}</strong>
          </div>
        )}
        <div className="card-scores" aria-label="Build ratings">
          <span>
            <b>{variant.ratings.accuracy.toFixed(1)}</b>Accuracy
          </span>
          <span>
            <b>{variant.ratings.pvp.toFixed(1)}</b>PvP
          </span>
          <span>
            <b>{variant.ratings.aura.toFixed(1)}</b>Aura
          </span>
        </div>
        <div className="card-footer">
          <span className="difficulty">
            {build.publicationStatus === "Reviewed"
              ? `${prepared.two ? "2" : "—"} / ${prepared.three ? "3" : "—"} / ${prepared.four ? "4" : "—"} slot${prepared.accessible ? " · Accessible" : ""}`
              : `${variant.bloodlineSlotCount} Bloodlines · alternatives researching`}
          </span>
          <button className="button button--text" onClick={() => onOpen(build)}>
            Quick view <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
});
