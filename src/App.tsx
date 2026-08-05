import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Dice5,
  Grid2X2,
  Heart,
  LogIn,
  Menu,
  Palette,
  Rows3,
  Search,
  SlidersHorizontal,
  Sparkles,
  Swords,
  Table2,
  X,
} from "lucide-react";
import { DiscordLink, RobloxGroupLink } from "./components/CommunityLinks";
import { DonationBar } from "./components/DonationBar";
import type { CharacterBuild } from "./types";
import {
  buildRepository,
  previewToRecord,
} from "./repositories/BuildRepository";
import type { ArchiveBuildRecord } from "./types/archiveAccess";
import { useArchivePrefs } from "./hooks/useArchivePrefs";
import { useBuildExperiencePrefs } from "./hooks/useBuildExperiencePrefs";
import { useBloodlineCollection } from "./hooks/useBloodlineCollection";
import { useTierLists } from "./hooks/useTierLists";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { migratePublicData } from "./services/publicMigration";
import { readStorage, writeStorage } from "./services/storage";
import { comparePublicationStatus } from "./lib/publication";
import { Gallery } from "./components/Gallery";
import { BuildTable } from "./components/BuildTable";
import { BuildQuickView } from "./components/BuildQuickView";
import { FullBuildPage } from "./components/FullBuildPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ArchiveSkeleton } from "./components/ArchiveSkeleton";
import { ToastRegion, type ToastMessage } from "./components/ToastRegion";
import { LockedBuildPage } from "./components/LockedBuildPage";
import { Portrait } from "./components/Portrait";
import { BrandMark } from "./components/BrandMark";
import { variantKenjutsu } from "./lib/variants";

const ComparePanel = lazy(() =>
  import("./components/ComparePanel").then((module) => ({
    default: module.ComparePanel,
  })),
);
const TierListBoard = lazy(() =>
  import("./components/TierListBoard").then((module) => ({
    default: module.TierListBoard,
  })),
);
const ArchiveWorkshop = lazy(() => import("./components/ArchiveWorkshop"));
const SuggestionsPage = lazy(() => import("./components/SuggestionsPage"));
const AccountPages = lazy(() => import("./components/AccountPages"));
const SeriesHub = lazy(() => import("./components/SeriesHub"));
const CharacterPackPicker = lazy(
  () => import("./components/CharacterPackPicker"),
);
const DiagnosticsPage = import.meta.env.DEV
  ? lazy(() => import("./components/DiagnosticsPage"))
  : null;

type View =
  | "builds"
  | "database"
  | "tiers"
  | "inventory"
  | "compare"
  | "suggestions"
  | "packs"
  | "account"
  | "diagnostics";
const emptyFilters = {
  media: "",
  franchise: "",
  series: "",
  status: "",
  legality: "",
  bloodline: "",
  slots: "",
  favorites: "",
  owned: "",
  access: "",
  equipment: "",
  sort: "archive",
};
const compareKey = "shindo-build-archive:compare:v1";
const freeBuildIds = [
  "zack-lee",
  "vasco",
  "gray-yeon",
  "yu",
  "jin-mori",
] as const;
type BuildRoute = { buildId: string; variantId?: string } | null;

function readBuildRoute(): BuildRoute {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length)
    : window.location.pathname;
  const match = path.match(/^\/build\/([^/]+)(?:\/([^/]+))?\/?$/);
  return match
    ? {
        buildId: decodeURIComponent(match[1]),
        variantId: match[2] ? decodeURIComponent(match[2]) : undefined,
      }
    : null;
}

function buildPath(buildId: string, variantId?: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/build/${encodeURIComponent(buildId)}${variantId ? `/${encodeURIComponent(variantId)}` : ""}`;
}

function withViewTransition(update: () => void) {
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

export default function App() {
  const [builds, setBuilds] = useState<ArchiveBuildRecord[]>([]);
  const [ownedCharacterIds, setOwnedCharacterIds] = useState<string[]>([]);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(() =>
    Object.keys(
      readStorage<{ selections?: Record<string, string> }>(
        "shindo-build-archive:character-pack-draft:v1",
        {},
      ).selections ?? {},
    ),
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { prefs, toggleFavorite, setPageSize, setMetaBias, setTheme } =
    useArchivePrefs();
  const buildExperience = useBuildExperiencePrefs();
  const {
    collection,
    setStatus,
    setElementStatus,
    setModeStatus,
    setEquipmentStatus,
    setMany,
    importPreferences,
    toggleFavorite: toggleBloodlineFavorite,
  } = useBloodlineCollection();
  const tiers = useTierLists();
  const [view, setView] = useState<View>("builds");
  const accountPage = new URLSearchParams(window.location.search).get(
    "account",
  ) as "signin" | "signup" | "account" | "premium" | null;
  const seriesPage = new URLSearchParams(window.location.search).get("series");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cardMode, setCardMode] = useState<"compact" | "visual">("compact");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CharacterBuild | null>(null);
  const [buildRoute, setBuildRoute] = useState<BuildRoute>(() =>
    readBuildRoute(),
  );
  const [galleryScroll, setGalleryScroll] = useState(0);
  const [suggestionBuild, setSuggestionBuild] = useState<{
    buildId: string;
    character: string;
    variant: string;
  } | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>(() =>
    readStorage(compareKey, []),
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const notify = useCallback(
    (text: string) =>
      setToast((current) =>
        current?.text === text ? current : { id: Date.now(), text },
      ),
    [],
  );

  useEffect(() => {
    migratePublicData();
    Promise.all([
      buildRepository.listBuildPreviews(),
      buildRepository.listAccess(),
    ])
      .then(async ([previews, access]) => {
        setOwnedCharacterIds(access.characterIds);
        const records = await Promise.all(
          previews.map(async (preview) => {
            const accessState = preview.free
              ? "Free"
              : access.fullArchive || access.characterIds.includes(preview.id)
                ? "Owned"
                : selectedPackIds.includes(preview.id)
                  ? "Selected"
                  : "Locked";
            if (accessState === "Free" || accessState === "Owned") {
              try {
                const full = await buildRepository.getBuild(preview.id);
                return {
                  ...full,
                  accessState,
                  publicVariantCount: preview.variantCount,
                  publicAvailableSlotCounts: [],
                } as ArchiveBuildRecord;
              } catch {
                return previewToRecord(
                  preview,
                  preview.free ? "Free" : "Locked",
                );
              }
            }
            return previewToRecord(preview, accessState);
          }),
        );
        setBuilds(records);
      })
      .catch(() =>
        setLoadError(
          "The archive could not be loaded. Your personal preferences were not changed.",
        ),
      )
      .finally(() => setLoading(false));
    // Access is intentionally loaded once; local pack selections are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const selectedIds = new Set(selectedPackIds);
    setBuilds((current) =>
      current.map((build) => {
        if (build.accessState === "Free" || build.accessState === "Owned")
          return build;
        const accessState = selectedIds.has(build.id) ? "Selected" : "Locked";
        return accessState === build.accessState
          ? build
          : { ...build, accessState };
      }),
    );
  }, [selectedPackIds]);
  useEffect(() => {
    const onPopState = () => setBuildRoute(readBuildRoute());
    addEventListener("popstate", onPopState);
    return () => removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
  }, [prefs.theme]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    writeStorage(
      compareKey,
      compareIds.filter((id) => builds.some((build) => build.id === id)),
    );
  }, [builds, compareIds]);

  const values = useMemo(
    () => ({
      franchises: [...new Set(builds.map((build) => build.franchise))].sort(),
      media: [
        ...new Set(builds.map((build) => build.media ?? "Manhwa")),
      ].sort(),
      series: [...new Set(builds.map((build) => build.series))].sort(),
      bloodlines: [
        ...new Set(
          builds.flatMap((build) =>
            build.variants.flatMap((variant) =>
              variant.bloodlines.map((slot) => slot.name),
            ),
          ),
        ),
      ].sort(),
    }),
    [builds],
  );
  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    const meta = prefs.metaBias / 100;
    return builds
      .filter((build) => {
        const primary =
          build.variants.find((variant) => variant.type === "Primary") ??
          build.variants[0];
        const locked =
          build.accessState === "Locked" || build.accessState === "Selected";
        const missing = primary
          ? [
              ...primary.bloodlines.map(
                (slot) => collection.statuses[slot.name],
              ),
              ...primary.elements.map(
                (slot) => collection.elementStatuses[slot.name],
              ),
            ].filter((status) => status !== "Owned").length
          : Number.POSITIVE_INFINITY;
        return (
          (!query ||
            `${build.name} ${build.series} ${build.franchise} ${build.media ?? "Manhwa"} ${build.version} ${build.variants.flatMap((variant) => variant.bloodlines.map((slot) => slot.name)).join(" ")}`
              .toLowerCase()
              .includes(query)) &&
          (!filters.media || (build.media ?? "Manhwa") === filters.media) &&
          (!filters.franchise || build.franchise === filters.franchise) &&
          (!filters.series || build.series === filters.series) &&
          (!filters.status || build.publicationStatus === filters.status) &&
          (!filters.legality ||
            (!locked && primary?.hotbarLegalityStatus === filters.legality)) &&
          (!filters.bloodline ||
            build.variants.some((variant) =>
              variant.bloodlines.some(
                (slot) => slot.name === filters.bloodline,
              ),
            )) &&
          (!filters.slots ||
            (locked
              ? build.publicAvailableSlotCounts.includes(Number(filters.slots))
              : build.variants.some(
                  (variant) =>
                    variant.bloodlineSlotCount === Number(filters.slots),
                ))) &&
          (!filters.favorites || prefs.favorites.includes(build.id)) &&
          (!filters.owned ||
            (filters.owned === "makeable" ? missing === 0 : missing <= 1)) &&
          (!filters.access || build.accessState === filters.access) &&
          (!filters.equipment ||
            (filters.equipment === "equipped"
              ? !locked &&
                primary &&
                (primary.weapon !== "None" ||
                  variantKenjutsu(primary) !== "None")
              : !locked &&
                primary &&
                primary.weapon === "None" &&
                variantKenjutsu(primary) === "None"))
        );
      })
      .sort(
        (a, b) =>
          comparePublicationStatus(a, b) ||
          (a.publicationStatus === "Reviewed" &&
          b.publicationStatus === "Reviewed"
            ? Number(a.media === "Manga / Anime") -
              Number(b.media === "Manga / Anime")
            : 0) ||
          (filters.sort === "name"
            ? a.name.localeCompare(b.name)
            : filters.sort === "accuracy"
              ? b.ratings.accuracy - a.ratings.accuracy
              : filters.sort === "pvp"
                ? b.ratings.pvp - a.ratings.pvp
                : b.ratings.accuracy * (1 - meta) +
                  b.ratings.pvp * meta -
                  (a.ratings.accuracy * (1 - meta) + a.ratings.pvp * meta)),
      );
  }, [
    builds,
    collection.elementStatuses,
    collection.statuses,
    filters,
    prefs.favorites,
    prefs.metaBias,
    search,
  ]);
  const pageSize = Number(prefs.pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageBuilds = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(
    () => setPage((current) => Math.min(current, pageCount)),
    [pageCount],
  );
  const accessibleBuilds = useMemo(
    () =>
      builds.filter(
        (build) =>
          build.accessState === "Free" || build.accessState === "Owned",
      ),
    [builds],
  );
  const compared = compareIds
    .map((id) => accessibleBuilds.find((build) => build.id === id))
    .filter(Boolean) as CharacterBuild[];
  const toggleCompare = useCallback(
    (id: string) =>
      setCompareIds((current) => {
        if (current.includes(id)) {
          notify("Removed from compare");
          return current.filter((item) => item !== id);
        }
        if (current.length >= 3) {
          notify("Compare limit reached (3/3)");
          return current;
        }
        notify(`Added to compare (${current.length + 1}/3)`);
        return [...current, id];
      }),
    [notify],
  );
  const toggleFavoriteWithToast = useCallback(
    (id: string) => {
      const adding = !prefs.favorites.includes(id);
      toggleFavorite(id);
      notify(adding ? "Favorite added" : "Favorite removed");
    },
    [notify, prefs.favorites, toggleFavorite],
  );
  const navigate = (next: View) => {
    withViewTransition(() => {
      if (buildRoute) {
        history.pushState(null, "", import.meta.env.BASE_URL);
        setBuildRoute(null);
      }
      setView(next);
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  };
  const nav: [View, string][] = [
    ["builds", "Builds"],
    ["database", "Database"],
    ["tiers", "Tier Lists"],
    ["inventory", "My Inventory"],
    ["compare", "Compare"],
    ["suggestions", "Suggestions"],
    ["packs", "Character Packs"],
  ];
  if (import.meta.env.DEV) nav.push(["diagnostics", "Diagnostics"]);
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== "sort" && value,
  ).length;
  const freeBuilds = freeBuildIds
    .map((id) => builds.find((build) => build.id === id))
    .filter((build): build is ArchiveBuildRecord => Boolean(build));
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => key !== "sort" && value,
  ) as [keyof typeof filters, string][];
  const routedBuild = buildRoute
    ? builds.find((build) => build.id === buildRoute.buildId)
    : undefined;
  const openFullBuild = (build: CharacterBuild, variantId?: string) => {
    setGalleryScroll(window.scrollY);
    const route = { buildId: build.id, variantId };
    withViewTransition(() => {
      history.pushState(route, "", buildPath(build.id, variantId));
      setBuildRoute(route);
      setSelected(null);
    });
  };
  const changeBuildVariantRoute = (variantId: string) => {
    if (!buildRoute) return;
    const route = { ...buildRoute, variantId };
    history.replaceState(route, "", buildPath(route.buildId, variantId));
    setBuildRoute(route);
  };
  const closeFullBuild = () => {
    if (history.state?.buildId) history.back();
    else {
      history.pushState(null, "", import.meta.env.BASE_URL);
      setBuildRoute(null);
      requestAnimationFrame(() =>
        window.scrollTo({ top: galleryScroll, behavior: "instant" }),
      );
    }
  };
  useEffect(() => {
    if (!buildRoute)
      requestAnimationFrame(() =>
        window.scrollTo({ top: galleryScroll, behavior: "instant" }),
      );
  }, [buildRoute, galleryScroll]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => navigate("builds")}>
          <BrandMark />
          <span>
            <b>Shindo Archive</b>
            <strong>Character Build Companion</strong>
          </span>
        </button>
        <button
          className="mobile-menu-button"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
        <nav
          className={mobileOpen ? "is-open" : ""}
          aria-label="Primary navigation"
        >
          {nav.map(([key, label]) => (
            <button
              key={key}
              className={view === key ? "active" : ""}
              onClick={() => navigate(key)}
            >
              {label}
            </button>
          ))}
          <button
            className={view === "account" ? "active" : ""}
            onClick={() => navigate("account")}
          >
            Account
          </button>
          <div className="nav-community-links">
            <DiscordLink />
            <RobloxGroupLink />
          </div>
        </nav>
      </header>

      {loading ? (
        <ArchiveSkeleton />
      ) : loadError ? (
        <main className="empty-state">
          <h2>Archive unavailable</h2>
          <p>{loadError}</p>
        </main>
      ) : buildRoute &&
        routedBuild &&
        (routedBuild.accessState === "Locked" ||
          routedBuild.accessState === "Selected") ? (
        <LockedBuildPage
          build={routedBuild}
          onBack={closeFullBuild}
          onUnlock={() => navigate("packs")}
        />
      ) : buildRoute && routedBuild ? (
        <FullBuildPage
          build={routedBuild}
          initialVariantId={buildRoute.variantId}
          collection={collection}
          variantFavorites={buildExperience.state.variantFavorites}
          watchlist={buildExperience.state.updateWatchlist}
          onBack={closeFullBuild}
          onVariantRoute={changeBuildVariantRoute}
          onFavoriteVariant={(id) => {
            buildExperience.toggleVariantFavorite(id);
            notify("Variant bookmark updated");
          }}
          onWatch={(id) => {
            buildExperience.toggleWatch(id);
            notify("Watchlist updated");
          }}
          onViewed={buildExperience.markViewed}
          onNotify={notify}
          onReportIssue={(variant) => {
            setSuggestionBuild({
              buildId: routedBuild.id,
              character: routedBuild.name,
              variant,
            });
            history.pushState(null, "", import.meta.env.BASE_URL);
            setBuildRoute(null);
            navigate("suggestions");
          }}
        />
      ) : buildRoute ? (
        <main className="empty-state">
          <h2>Build not found</h2>
          <p>This build URL does not match a current archive record.</p>
          <button className="button button--primary" onClick={closeFullBuild}>
            Back to archive
          </button>
        </main>
      ) : view === "tiers" ? (
        <Suspense
          fallback={
            <main className="loading-page">Loading your tier lists…</main>
          }
        >
          <main>
            <TierListBoard
              builds={builds}
              lists={tiers.lists}
              onCreate={tiers.create}
              onUpdate={tiers.update}
              onDuplicate={tiers.duplicate}
              onDelete={tiers.remove}
              onImportShared={tiers.addShared}
            />
          </main>
        </Suspense>
      ) : view === "inventory" ? (
        <Suspense
          fallback={<main className="loading-page">Loading inventory…</main>}
        >
          <ArchiveWorkshop
            builds={accessibleBuilds}
            collection={collection}
            onStatus={(...args) => {
              setStatus(...args);
              notify("Inventory state updated");
            }}
            onElementStatus={(...args) => {
              setElementStatus(...args);
              notify("Inventory state updated");
            }}
            onModeStatus={(...args) => {
              setModeStatus(...args);
              notify("Inventory state updated");
            }}
            onEquipmentStatus={(...args) => {
              setEquipmentStatus(...args);
              notify("Inventory state updated");
            }}
            onBulk={setMany}
            onImport={importPreferences}
            onFavorite={toggleBloodlineFavorite}
          />
        </Suspense>
      ) : view === "suggestions" ? (
        <Suspense
          fallback={<main className="loading-page">Loading suggestions…</main>}
        >
          <SuggestionsPage issueContext={suggestionBuild} />
        </Suspense>
      ) : view === "account" || accountPage ? (
        <Suspense
          fallback={<main className="loading-page">Loading account…</main>}
        >
          <AccountPages initialPage={accountPage ?? "signin"} />
        </Suspense>
      ) : view === "packs" ? (
        <Suspense
          fallback={
            <main className="loading-page">Loading character packs…</main>
          }
        >
          <CharacterPackPicker
            builds={builds}
            ownedIds={ownedCharacterIds}
            onDraftChange={setSelectedPackIds}
          />
        </Suspense>
      ) : seriesPage ? (
        <Suspense
          fallback={<main className="loading-page">Loading series…</main>}
        >
          <SeriesHub
            builds={builds}
            series={seriesPage}
            onOpen={openFullBuild}
          />
        </Suspense>
      ) : view === "compare" ? (
        <main className="compare-page">
          <header className="systems-hero">
            <span className="eyebrow">
              <Swords size={15} /> COMPARE
            </span>
            <h1>Compare character builds.</h1>
            <p>
              Select up to three builds from the gallery, then compare their
              available reviewed or draft variants.
            </p>
          </header>
          {compared.length >= 2 ? (
            <Suspense fallback={null}>
              <ComparePanel
                builds={compared}
                slotLimit={4}
                onRemove={toggleCompare}
                onClose={() => navigate("builds")}
              />
            </Suspense>
          ) : (
            <div className="empty-state">
              <h3>Select at least two builds</h3>
              <button
                className="button button--primary"
                onClick={() => navigate("builds")}
              >
                Browse builds
              </button>
            </div>
          )}
        </main>
      ) : view === "diagnostics" && import.meta.env.DEV && DiagnosticsPage ? (
        <Suspense
          fallback={<main className="loading-page">Loading diagnostics…</main>}
        >
          <DiagnosticsPage
            builds={builds}
            visibleCount={pageBuilds.length}
            filteringDuration={0}
          />
        </Suspense>
      ) : (
        <main>
          <section className="archive-hero">
            <div className="archive-hero__seal" aria-hidden="true">
              <BrandMark />
            </div>
            <div className="archive-hero__copy">
              <span className="eyebrow">
                <Sparkles size={14} /> Premium Shindo loadout companion
              </span>
              <h1>Build like the character.</h1>
              <p>
                A focused archive of character-inspired Shindo loadouts, direct
                game icons, legal hotbars, and clearly labeled research.
              </p>
              <div className="archive-hero__actions">
                <button
                  className="button button--primary"
                  onClick={() => navigate("account")}
                >
                  <LogIn size={16} /> Sign in for access
                </button>
                <button
                  className="button button--outline"
                  onClick={() =>
                    document
                      .querySelector(".featured-free-builds")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore free builds
                </button>
                <DiscordLink className="button button--outline" />
              </div>
            </div>
            <div className="archive-hero__collage" aria-hidden="true">
              {freeBuilds.slice(0, 3).map((build) => (
                <Portrait
                  key={build.id}
                  src={build.thumbnail || build.image}
                  alt=""
                  thumbnail
                />
              ))}
            </div>
            <div className="archive-stats">
              <div>
                <strong>{builds.length}</strong>
                <span>Characters</span>
              </div>
              <div>
                <strong>{values.series.length}</strong>
                <span>Series</span>
              </div>
              <div>
                <strong>20</strong>
                <span>Researched</span>
              </div>
              <div>
                <strong>{freeBuilds.length}</strong>
                <span>Free builds</span>
              </div>
            </div>
          </section>
          <DonationBar />
          <section
            className="featured-free-builds"
            aria-label="Featured free builds"
          >
            <header>
              <div>
                <span className="eyebrow">Start here</span>
                <h2>Five builds. Permanently free.</h2>
              </div>
              <p>
                Open a complete build and see the archive’s game hotbar, direct
                icons, and research structure.
              </p>
            </header>
            <div>
              {freeBuilds.map((build) => (
                <button key={build.id} onClick={() => openFullBuild(build)}>
                  <span className="featured-free-builds__portrait">
                    <Portrait
                      src={build.thumbnail || build.image}
                      alt={build.name}
                      thumbnail
                    />
                    <i>Free</i>
                  </span>
                  <span>
                    <strong>{build.name}</strong>
                    <small>{build.series}</small>
                    <em>View build</em>
                  </span>
                </button>
              ))}
            </div>
          </section>
          {buildExperience.state.recentlyViewed.length > 0 && (
            <section
              className="recent-builds"
              aria-label="Recently viewed builds"
            >
              <span>Recently viewed</span>
              <div className="recent-builds__list">
                {buildExperience.state.recentlyViewed
                  .map((id) => builds.find((build) => build.id === id))
                  .filter((build): build is ArchiveBuildRecord =>
                    Boolean(build),
                  )
                  .map((build) => (
                    <button key={build.id} onClick={() => openFullBuild(build)}>
                      {build.name}
                      <small>{build.version}</small>
                    </button>
                  ))}
              </div>
            </section>
          )}
          <section className="controls-shell">
            <div className="search-wrap">
              <Search size={21} />
              <input
                aria-label="Search builds"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
                placeholder="Search characters, series, arcs, or Bloodlines…"
              />
            </div>
            <button
              className="filter-drawer-button button button--outline"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={17} /> Advanced
              {activeFilterCount ? ` (${activeFilterCount})` : ""}
            </button>
            <details className="appearance-popover">
              <summary className="button button--outline">
                <Palette size={17} /> Appearance
              </summary>
              <div>
                <label>
                  Theme
                  <select
                    aria-label="Appearance theme"
                    value={prefs.theme}
                    onChange={(event) =>
                      setTheme(event.target.value as typeof prefs.theme)
                    }
                  >
                    <option value="ember-crimson">Ember Crimson (default)</option>
                    <option value="shindo-green">Shindo Green</option>
                    <option value="chakra-blue">Chakra Blue</option>
                  </select>
                </label>
                <label className="bias-control">
                  <span>Lore</span>
                  <input
                    aria-label="Lore accuracy versus PvP meta"
                    type="range"
                    min="0"
                    max="100"
                    value={prefs.metaBias}
                    onChange={(event) =>
                      setMetaBias(Number(event.target.value))
                    }
                  />
                  <span>Meta</span>
                </label>
              </div>
            </details>
            <div className="common-filter-row" aria-label="Common filters">
              <select
                aria-label="Filter by media category"
                value={filters.media}
                onChange={(e) =>
                  setFilters({ ...filters, media: e.target.value })
                }
              >
                <option value="">All media</option>
                {values.media.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                aria-label="Filter by franchise"
                value={filters.franchise}
                onChange={(e) =>
                  setFilters({ ...filters, franchise: e.target.value })
                }
              >
                <option value="">All franchises</option>
                {values.franchises.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                aria-label="Filter by series"
                value={filters.series}
                onChange={(e) =>
                  setFilters({ ...filters, series: e.target.value })
                }
              >
                <option value="">All series</option>
                {values.series.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                aria-label="Filter by publication status"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All statuses</option>
                <option>Reviewed</option>
                <option>Needs Retesting</option>
                <option>Draft</option>
                <option>Needs Research</option>
              </select>
            </div>
          </section>
          <section className={`filter-row ${filtersOpen ? "is-open" : ""}`}>
            <span>
              <SlidersHorizontal size={15} /> Advanced filters
            </span>
            <select
              aria-label="Filter by game legality"
              value={filters.legality}
              onChange={(e) =>
                setFilters({ ...filters, legality: e.target.value })
              }
            >
              <option value="">Any legality</option>
              <option>Game Legal</option>
              <option>Legal With Unverified Placement</option>
              <option>Needs Live Test</option>
            </select>
            <select
              aria-label="Filter by Bloodline"
              value={filters.bloodline}
              onChange={(e) =>
                setFilters({ ...filters, bloodline: e.target.value })
              }
            >
              <option value="">All Bloodlines</option>
              {values.bloodlines.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              aria-label="Filter by Bloodline slot count"
              value={filters.slots}
              onChange={(e) =>
                setFilters({ ...filters, slots: e.target.value })
              }
            >
              <option value="">Any slots</option>
              <option value="2">2 Bloodline slots</option>
              <option value="3">3 Bloodline slots</option>
              <option value="4">4 Bloodline slots</option>
            </select>
            <select
              aria-label="Filter by inventory readiness"
              value={filters.owned}
              onChange={(e) =>
                setFilters({ ...filters, owned: e.target.value })
              }
            >
              <option value="">Any inventory</option>
              <option value="makeable">Builds I can make</option>
              <option value="missing-one">Missing one item</option>
            </select>
            <select
              aria-label="Filter by access state"
              value={filters.access}
              onChange={(e) =>
                setFilters({ ...filters, access: e.target.value })
              }
            >
              <option value="">Any access</option>
              <option>Free</option>
              <option>Owned</option>
              <option>Selected</option>
              <option>Locked</option>
            </select>
            <select
              aria-label="Filter by weapon or Kenjutsu"
              value={filters.equipment}
              onChange={(e) =>
                setFilters({ ...filters, equipment: e.target.value })
              }
            >
              <option value="">Any equipment</option>
              <option value="equipped">Weapon / Kenjutsu equipped</option>
              <option value="unarmed">Unarmed</option>
            </select>
            <select
              aria-label="Sort builds"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="archive">Archive order</option>
              <option value="name">Name</option>
              <option value="accuracy">Accuracy</option>
              <option value="pvp">PvP</option>
            </select>
            <button
              className={`favorites-filter ${filters.favorites ? "active" : ""}`}
              onClick={() =>
                setFilters({
                  ...filters,
                  favorites: filters.favorites ? "" : "only",
                })
              }
            >
              <Heart size={13} /> Favorites
            </button>
            <button
              className="clear-filter"
              disabled={!activeFilterCount}
              onClick={() => setFilters(emptyFilters)}
            >
              Clear all filters
            </button>
          </section>
          {activeFilters.length > 0 && (
            <section
              className="active-filter-chips"
              aria-label="Active filters"
            >
              <span>Active</span>
              {activeFilters.map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setFilters({ ...filters, [key]: "" })}
                >
                  {key}: {value}
                  <X size={13} />
                </button>
              ))}
              <button
                className="clear-filter"
                onClick={() => setFilters(emptyFilters)}
              >
                Clear all
              </button>
            </section>
          )}
          <div className="results-bar">
            <div>
              <strong>{filtered.length}</strong> archive results
            </div>
            <div className="view-switch">
              <button
                className={
                  view === "builds" && cardMode === "compact" ? "active" : ""
                }
                onClick={() => {
                  navigate("builds");
                  setCardMode("compact");
                }}
                aria-label="Compact cards"
              >
                <Grid2X2 size={16} />
              </button>
              <button
                className={
                  view === "builds" && cardMode === "visual" ? "active" : ""
                }
                onClick={() => {
                  navigate("builds");
                  setCardMode("visual");
                }}
                aria-label="Visual cards"
              >
                <Rows3 size={16} />
              </button>
              <button
                className={view === "database" ? "active" : ""}
                onClick={() => navigate("database")}
                aria-label="Table view"
              >
                <Table2 size={16} />
              </button>
              <button
                onClick={() =>
                  accessibleBuilds.length &&
                  setSelected(
                    accessibleBuilds[
                      Math.floor(Math.random() * accessibleBuilds.length)
                    ],
                  )
                }
                aria-label="Random accessible build"
              >
                <Dice5 size={16} />
              </button>
            </div>
          </div>
          {view === "database" ? (
            <BuildTable
              builds={pageBuilds}
              slotLimit={4}
              onOpen={(build) =>
                (build as ArchiveBuildRecord).accessState === "Locked" ||
                (build as ArchiveBuildRecord).accessState === "Selected"
                  ? openFullBuild(build)
                  : setSelected(build)
              }
              onClear={() => setFilters(emptyFilters)}
            />
          ) : (
            <ErrorBoundary section="gallery">
              <Gallery
                builds={pageBuilds}
                slotLimit={4}
                compareIds={compareIds}
                favorites={prefs.favorites}
                onOpen={setSelected}
                onUnlock={(id) => {
                  const build = builds.find((item) => item.id === id);
                  if (build) openFullBuild(build);
                }}
                onCompare={toggleCompare}
                onFavorite={toggleFavoriteWithToast}
                onClear={() => setFilters(emptyFilters)}
                mode={cardMode}
                performanceMode={false}
              />
            </ErrorBoundary>
          )}
          <div className="pagination">
            <div>
              {(["12", "24", "48", "96"] as const).map((size) => (
                <button
                  className={prefs.pageSize === size ? "active" : ""}
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    setPage(1);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
            <span>
              {filtered.length ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, filtered.length)} OF {filtered.length}
            </span>
            <div>
              <button
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </button>
              <strong>
                {page}/{pageCount}
              </strong>
              <button
                disabled={page >= pageCount}
                onClick={() => setPage((value) => value + 1)}
                aria-label="Next page"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </main>
      )}

      <footer className="site-footer">
        <div className="site-footer__links">
          <DiscordLink />
          <RobloxGroupLink />
        </div>
        <p>
          Unofficial fan-made build archive. Not affiliated with RELL World or Roblox Corp. Game balance and abilities may change.
        </p>
      </footer>
      {selected && selected.variants.length > 0 && (
        <BuildQuickView
          build={selected}
          onClose={() => setSelected(null)}
          onOpenFull={() => openFullBuild(selected)}
        />
      )}
      <ToastRegion message={toast} />
    </div>
  );
}
