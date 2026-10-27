"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  // @ts-expect-error - unstable_ViewTransition is not yet in @types/react
  unstable_ViewTransition as ViewTransition,
  useEffect,
  useSyncExternalStore,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FixedSizeGrid as Grid } from "react-window";
import {
  SCREENSHOT_WIDTH,
  SKIN_RATIO,
} from "../../../legacy-client/src/constants";
import { GridSkin } from "./gridSkin";
import { MAX_GRID_IMPRESSIONS, type ListSource } from "./eventTypes";
import { enterView, setNextViewVia, useEventLogger } from "./eventLogger";
import { getSearchDebounceMs } from "../../../legacy-client/src/searchConfig";
import { gridPath, skinPath } from "./paths";
import {
  adoptRandomSeed,
  cacheSearch,
  getCachedSearch,
  loadMuseumRange,
  loadSearch,
  seedMuseum,
  useMuseum,
} from "./skinList";
import { MUSEUM_SORTS, parseMuseumSort, type MuseumSort } from "./museumList";
import { getListPosition, setListPosition } from "./listPosition";
import { corsScreenshotUrl } from "./skinTint";
import HintPill, { markHintDone } from "./HintPill";
import {
  ArrowUpDown,
  Check,
  Clock,
  EyeOff,
  Pointer,
  Search,
  Shuffle,
  Star,
  X,
} from "lucide-react";
import { rememberSkinNsfw, useShowNsfw } from "./nsfwConsent";
import { isModifiedClick } from "./MuseumMenu";
import FloatingBar from "./FloatingBar";

// Remembered once the visitor has tapped a skin (see HintPill).
const GRID_HINT_KEY = "grid-hint-dismissed";

// Where each visit to the grid was scrolled to (its first visible skin), by
// history entry (see useHistoryEntryKey), so coming Back to it returns there
// if the feed hasn't moved you on since (see restoreIndex). An index rather
// than pixels, so it survives a change in column count. In memory only: a
// reload starts at the top.
const scrollPositions = new Map<string, number>();

// Skins on screen once scrolling has stopped for this long are reported as
// seen (grid_impressions).
const GRID_IMPRESSION_MS = 1000;
// The skins reported as seen this visit, by list ("query\nsort\nmd5"), so
// each is reported once.
const reportedImpressions = new Set<string>();

type CellData = {
  // Sparse: pages are written at their offset as they arrive.
  skins: ReadonlyArray<GridSkin | undefined>;
  columnCount: number;
  width: number;
  height: number;
  onSkinClick: (skin: GridSkin, position: number, newTab: boolean) => void;
};

function Cell({
  columnIndex,
  rowIndex,
  style,
  data,
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: CellData;
}) {
  const { skins, width, height, columnCount } = data;
  const showNsfw = useShowNsfw();
  const index = rowIndex * columnCount + columnIndex;
  const skin = skins[index];

  if (!skin) {
    return null;
  }

  return (
    <div style={style}>
      <div
        className="grid-tile"
        style={{ width, height, position: "relative" }}
      >
        <Link
          href={skinPath(skin.md5, skin.fileName)}
          onClick={(e) => {
            rememberSkinNsfw(skin.md5, skin.nsfw);
            data.onSkinClick(skin, index, isModifiedClick(e));
          }}
        >
          <ViewTransition name={`skin-${skin.md5}`}>
            <img
              // The same URL and request mode as the feed's screenshots
              // (which read their colors), so the browser caches one copy.
              crossOrigin="anonymous"
              src={corsScreenshotUrl(skin.screenshotUrl)}
              alt={skin.fileName}
              // Opening it shows the choice to see it (see NsfwCover).
              className={skin.nsfw && !showNsfw ? "nsfw-blurred" : undefined}
            />
          </ViewTransition>
        </Link>
        <div className="grid-tile-name" aria-hidden>
          {skin.fileName}
        </div>
        {skin.nsfw && !showNsfw && (
          <div className="grid-tile-nsfw" aria-hidden>
            <EyeOff size={14} />
            NSFW
          </div>
        )}
      </div>
    </div>
  );
}

type SkinTableProps = {
  // The first page of the museum in initialSort (empty with a search).
  initialSkins: GridSkin[];
  // How many skins the museum has in each order.
  totals: Record<MuseumSort, number>;
  // The search in the URL (?query=), if any.
  initialQuery: string;
  // The museum's order in the URL (?sort=), if any.
  initialSort: MuseumSort;
  // The random order the server picked, if initialSort is "random".
  initialSeed: number | null;
  // That search's results, if the server ran it (initialSkins is then empty).
  initialSearchSkins: GridSkin[] | null;
};

const SORT_LABELS: Record<MuseumSort, string> = {
  top: "Top",
  newest: "Newest",
  random: "Random",
};

const SORT_ICONS: Record<MuseumSort, typeof Star> = {
  top: Star,
  newest: Clock,
  random: Shuffle,
};

// The window's size, or null while hydrating. The grid is laid out to fit
// the window, so it isn't rendered on the server (or the first client render,
// which has to match it). Navigating to the grid renders it straight away, so
// a view transition into it sees its tiles.
type WindowSize = { width: number; height: number };
let windowSize: WindowSize | null = null;

function getWindowSize(): WindowSize {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  if (windowSize?.width !== width || windowSize.height !== height) {
    windowSize = { width, height };
  }
  return windowSize;
}

function subscribeToResize(onChange: () => void): () => void {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function useMountedWindowSize(): WindowSize | null {
  return useSyncExternalStore(subscribeToResize, getWindowSize, () => null);
}

export default function SkinTable({
  initialSkins,
  totals,
  initialQuery,
  initialSort,
  initialSeed,
  initialSearchSkins,
}: SkinTableProps) {
  const windowSize = useMountedWindowSize();
  const windowWidth = windowSize?.width ?? 0;
  const windowHeight = windowSize?.height ?? 0;

  const logger = useEventLogger();

  // The search box's text. From the live URL rather than only the server's render: coming Back to a
  // search, the page can be the one first rendered without it.
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(
    () => searchParams.get("query") ?? initialQuery
  );
  // Results for the search we're starting with, if we have them: the
  // server's, or ones from earlier in this visit.
  const [initialResults] = useState(() => {
    const query = inputValue.trim();
    const skins =
      initialSearchSkins != null && query === initialQuery.trim()
        ? initialSearchSkins
        : getCachedSearch(query);
    if (query === "" || skins == null) return null;
    // Not a new search if we're coming back to it.
    const isNew = getCachedSearch(query) == null;
    cacheSearch(query, skins);
    return { query, skins, isNew };
  });

  // Browsing: the museum in the chosen order, as far as it's loaded (see
  // skinList.ts). Like the search, from the live URL. Searches aren't sorted:
  // the order applies while the search box is empty.
  const [sort, setSort] = useState<MuseumSort>(() =>
    parseMuseumSort(searchParams.get("sort") ?? initialSort)
  );
  // Whether the menu for choosing it is open (see the sort button).
  const [sortOpen, setSortOpen] = useState(false);
  useState(() => {
    if (initialSeed != null) adoptRandomSeed(initialSeed);
    for (const s of MUSEUM_SORTS) {
      seedMuseum(s, null, 0, [], totals[s]);
    }
    seedMuseum(initialSort, initialSeed, 0, initialSkins, totals[initialSort]);
  });
  const browse = useMuseum(sort);
  const browseSkins = browse.skins;

  // State for search mode
  const [searchSkins, setSearchSkins] = useState<GridSkin[]>(
    initialResults?.skins ?? []
  );
  const [searchError, setSearchError] = useState<string | null>(null);
  // The query that `searchSkins`/`searchError` are the outcome of. Until it
  // matches the input, a search is pending (debouncing or in flight).
  const [resultsQuery, setResultsQuery] = useState<string | null>(
    initialResults?.query ?? null
  );
  const resultsQueryRef = useRef(resultsQuery);
  resultsQueryRef.current = resultsQuery;

  // Determine which mode we're in based on actual search query, not input
  const isSearchMode = inputValue.trim().length > 0;
  const searchPending = isSearchMode && resultsQuery !== inputValue.trim();
  // While a search is pending we leave whatever was already on screen mounted:
  // the previous query's results, or the browse grid if this is the first
  // query. So we show search results once any query has resolved.
  const showSearchResults = isSearchMode && resultsQuery !== null;
  const skins = showSearchResults ? searchSkins : browseSkins;
  const total = showSearchResults
    ? searchSkins.length
    : browse.total ?? totals[sort];
  // The list on screen: a search, or the museum in an order. Events name a
  // search's order as null.
  const listQuery = showSearchResults ? resultsQuery! : "";
  const listSort: MuseumSort = showSearchResults ? "top" : sort;
  const eventSort = showSearchResults ? null : sort;

  // Keep the URL to what's shown: the search, or else the order.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searching = inputValue.trim() !== "";
    if (
      (params.get("query") ?? "") !== inputValue ||
      parseMuseumSort(params.get("sort")) !== (searching ? "top" : sort)
    ) {
      replaceHistoryEntry(
        {},
        searching ? gridPath(inputValue) : gridPath("", sort)
      );
    }
  }, [inputValue, sort]);

  useEffect(() => {
    const query = inputValue.trim();

    // Already showing this search's results (the server's, or cached).
    if (query.length > 0 && query === resultsQueryRef.current) {
      return;
    }

    // If query is empty, clear results immediately
    if (query.length === 0) {
      setSearchSkins([]);
      setSearchError(null);
      setResultsQuery(null);
      return;
    }

    // Debounce, and ignore responses that arrive after a newer query.
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const skins = await loadSearch(query);
        if (cancelled) return;
        setSearchSkins(skins);
        setSearchError(null);
        setResultsQuery(query);
        logger.log({ type: "grid_search", query, resultCount: skins.length });
      } catch (err) {
        if (cancelled) return;
        console.error("Search failed:", err);
        setSearchError("Search failed. Please try again.");
        setSearchSkins([]);
        setResultsQuery(query);
      }
    }, getSearchDebounceMs());

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inputValue]);

  const columnCount = Math.max(
    1,
    Math.round(windowWidth / (SCREENSHOT_WIDTH * 0.9))
  );
  const columnWidth = windowWidth / columnCount;
  const rowHeight = columnWidth * SKIN_RATIO;

  // The rows the grid last rendered (including overscan).
  const renderedRowsRef = useRef<[number, number]>([0, 0]);
  const loadPagesForRows = useCallback(
    (firstRow: number, lastRow: number) => {
      loadMuseumRange(
        sort,
        firstRow * columnCount,
        (lastRow + 1) * columnCount - 1
      );
    },
    [columnCount, sort]
  );

  const onItemsRendered = useCallback(
    ({
      overscanRowStartIndex,
      overscanRowStopIndex,
    }: {
      overscanRowStartIndex: number;
      overscanRowStopIndex: number;
    }) => {
      renderedRowsRef.current = [overscanRowStartIndex, overscanRowStopIndex];
      if (showSearchResults) {
        return;
      }
      loadPagesForRows(overscanRowStartIndex, overscanRowStopIndex);
    },
    [showSearchResults, loadPagesForRows]
  );

  // Clearing a search (or changing the order) shows the browse grid in the
  // rows that were already on screen, so onItemsRendered isn't called again;
  // load their pages here.
  useEffect(() => {
    if (!showSearchResults) {
      loadPagesForRows(...renderedRowsRef.current);
    }
  }, [showSearchResults, loadPagesForRows]);

  const itemKey = useCallback(
    ({ columnIndex, rowIndex }: { columnIndex: number; rowIndex: number }) => {
      const index = rowIndex * columnCount + columnIndex;
      const skin = skins[index];
      return skin ? skin.md5 : `empty-cell-${columnIndex}-${rowIndex}`;
    },
    [columnCount, skins]
  );

  // Coming back to the grid (e.g. with the feed's Back button) returns to the
  // skin you were on: the one in view in the feed, if you were in the feed
  // showing this list, otherwise where this visit to the grid was scrolled
  // to. The grid is first rendered already scrolled there, so the skin you
  // came back from is on screen for the view transition to land on.
  const scrollKey = useHistoryEntryKey();
  const [restoreIndex] = useState(() => {
    if (typeof window === "undefined") return undefined;
    const position = getListPosition();
    const startQuery = initialResults?.query ?? "";
    if (
      position != null &&
      position.query === startQuery &&
      (startQuery !== "" || position.sort === sort)
    ) {
      return position.index;
    }
    return scrollPositions.get(window.history.state?.gridEntryKey);
  });

  const initialScrollTop =
    restoreIndex == null
      ? 0
      : Math.floor(restoreIndex / columnCount) * rowHeight;

  // Report the skins on screen, once scrolling has stopped (or what's on
  // screen has changed) and they've been there a moment.
  const scrollTopRef = useRef(initialScrollTop);
  const impressionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportImpressionsRef = useRef(() => {});
  reportImpressionsRef.current = () => {
    if (rowHeight === 0 || document.visibilityState !== "visible") return;
    const scrollTop = scrollTopRef.current;
    // Rows at least half on screen.
    const firstRow = Math.max(0, Math.ceil(scrollTop / rowHeight - 0.5));
    const lastRow = Math.floor((scrollTop + windowHeight) / rowHeight - 0.5);
    const seen: Array<[string, number, ListSource]> = [];
    for (let i = firstRow * columnCount; i < (lastRow + 1) * columnCount; i++) {
      const skin = skins[i];
      const key = `${listQuery}\n${listSort}\n${skin?.md5}`;
      if (skin == null || reportedImpressions.has(key)) continue;
      reportedImpressions.add(key);
      seen.push([skin.md5, i, skin.random ? "random" : "list"]);
    }
    for (let i = 0; i < seen.length; i += MAX_GRID_IMPRESSIONS) {
      logger.log({
        type: "grid_impressions",
        query: listQuery || null,
        sort: eventSort,
        skins: seen.slice(i, i + MAX_GRID_IMPRESSIONS),
      });
    }
  };
  const scheduleImpressions = useCallback(() => {
    if (impressionTimerRef.current != null) {
      clearTimeout(impressionTimerRef.current);
    }
    impressionTimerRef.current = setTimeout(
      () => reportImpressionsRef.current(),
      GRID_IMPRESSION_MS
    );
  }, []);
  useEffect(() => {
    scheduleImpressions();
  }, [
    scheduleImpressions,
    skins,
    listQuery,
    listSort,
    columnCount,
    rowHeight,
    windowHeight,
  ]);
  useEffect(() => {
    return () => {
      if (impressionTimerRef.current != null) {
        clearTimeout(impressionTimerRef.current);
      }
    };
  }, []);

  // Set once a skin's been tapped to open here (see onScroll).
  const leavingRef = useRef(false);
  const onScroll = useCallback(
    ({
      scrollTop,
      scrollUpdateWasRequested,
    }: {
      scrollTop: number;
      scrollUpdateWasRequested: boolean;
    }) => {
      scrollTopRef.current = scrollTop;
      scheduleImpressions();
      if (rowHeight === 0) return;
      const index = Math.round(scrollTop / rowHeight) * columnCount;
      if (scrollKey != null) scrollPositions.set(scrollKey, index);
      // Only the visitor's own scrolling moves them on from the skin they
      // came back to (not where the grid starts, or scrolls itself to). Not
      // once a skin's been tapped: a scroll that was still settling would
      // replace it as where the feed opens in the list.
      if (
        leavingRef.current ||
        scrollUpdateWasRequested ||
        scrollTop === initialScrollTop
      ) {
        return;
      }
      const skin = skins[index];
      if (skin != null) {
        setListPosition({ query: listQuery, sort: listSort, index, skin });
      }
    },
    [
      columnCount,
      rowHeight,
      scrollKey,
      skins,
      listQuery,
      listSort,
      initialScrollTop,
      scheduleImpressions,
    ]
  );

  // Strict Mode runs this effect twice in development; log one arrival.
  const enteredRef = useRef(false);
  useEffect(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    const position = getListPosition();
    const cameBackTo =
      restoreIndex != null && position?.index === restoreIndex
        ? position
        : null;
    enterView("grid", {
      query: inputValue.trim() || null,
      sort: inputValue.trim() === "" ? sort : null,
      skinMd5: cameBackTo?.skin.md5 ?? null,
      listIndex: cameBackTo?.index ?? null,
    });
    if (initialResults?.isNew) {
      logger.log({
        type: "grid_search",
        query: initialResults.query,
        resultCount: initialResults.skins.length,
      });
    }
    // Only on mount: the search the grid was opened with.
  }, [logger]);

  // Keyboard shortcuts to jump to the search box: "/" (when not already typing
  // somewhere) and Cmd/Ctrl+K (from anywhere).
  const searchInputRef = useRef<HTMLInputElement>(null);
  // For the logo, which scrolls back to the top.
  const gridRef = useRef<Grid>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const input = searchInputRef.current;
      if (input == null || e.defaultPrevented) return;
      const isCommandK =
        (e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k";
      const isSlash =
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target as HTMLElement | null)?.closest(
          "input, textarea, select, [contenteditable]"
        );
      if (!isCommandK && !isSlash) return;
      e.preventDefault();
      input.focus();
      input.select();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSkinClick = useCallback(
    (skin: GridSkin, position: number, newTab: boolean) => {
      // Opening it here, rather than in a new tab, leaves the grid.
      if (!newTab) leavingRef.current = true;
      logger.log({
        type: "grid_skin_click",
        skinMd5: skin.md5,
        position,
        source: skin.random ? "random" : "list",
        query: listQuery || null,
        sort: eventSort,
      });
      // The feed continues through this list from here.
      setListPosition({
        query: listQuery,
        sort: listSort,
        index: position,
        skin,
      });
      setNextViewVia("grid");
      markHintDone(GRID_HINT_KEY);
    },
    [logger, listQuery, listSort, eventSort]
  );

  function toggleSort() {
    if (!sortOpen) logger.log({ type: "sort_open" });
    setSortOpen(!sortOpen);
  }

  function chooseSort(next: MuseumSort) {
    logger.log({ type: "grid_sort", sort: next });
    // Picking one closes the menu. Focus goes back to its button, rather
    // than falling to the page with the menu.
    setSortOpen(false);
    sortButtonRef.current?.focus();
    if (next === sort) return;
    setSort(next);
    // A new list, from its start.
    gridRef.current?.scrollTo({ scrollTop: 0 });
  }

  // Like the "…" menu (MuseumMenu.tsx), a press outside the sort menu, or
  // Escape, closes it.
  const sortMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sortOpen) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Element;
      // The button opens and closes it itself.
      if (target.closest(".grid-sort-button")) return;
      if (!sortMenuRef.current?.contains(target)) setSortOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setSortOpen(false);
      sortButtonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sortOpen]);

  const itemData: CellData = useMemo(
    () => ({
      skins,
      columnCount,
      width: columnWidth,
      height: rowHeight,
      onSkinClick,
    }),
    [skins, columnCount, columnWidth, rowHeight, onSkinClick]
  );

  return (
    <div id="infinite-skins" className={sortOpen ? "sort-open" : undefined}>
      <HintPill
        storageKey={GRID_HINT_KEY}
        done={false}
        onShown={() => logger.log({ type: "grid_hint_shown" })}
        icon={<Pointer size={16} />}
        className="hint-pill-grid"
      >
        Tap a skin to try it in Webamp
      </HintPill>
      {/* Here, the logo goes back to the start of the museum, in its own order. */}
      <FloatingBar
        onLogoClick={() => {
          setInputValue("");
          setSort("top");
          setSortOpen(false);
          gridRef.current?.scrollTo({ scrollTop: 0 });
        }}
      >
        <div className="grid-search-field">
          <Search className="grid-search-icon" size={18} aria-hidden />
          <input
            className={
              "grid-search-input" +
              (inputValue !== "" ? " has-value" : ` has-sort sort-${sort}`) +
              (searchPending ? " pending" : "")
            }
            type="search"
            enterKeyHint="search"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Searches aren't sorted: the sort button gives way to the
              // clear button, and its menu closes.
              if (e.target.value !== "") setSortOpen(false);
            }}
            ref={searchInputRef}
            onKeyDown={(e) => {
              // Search runs as you type; Enter just dismisses the keyboard,
              // and Escape leaves the search box.
              if (e.key === "Enter" || e.key === "Escape") {
                e.currentTarget.blur();
              }
            }}
            placeholder="Search skins..."
            aria-label="Search skins"
            aria-keyshortcuts="/ Meta+K Control+K"
            title="Search skins (/ or ⌘K)"
            aria-busy={searchPending}
          />
          {searchPending && (
            <div
              className="search-spinner"
              role="status"
              aria-label="Searching"
            />
          )}
          {sortOpen && inputValue === "" && (
            <div
              id="grid-sort-menu"
              ref={sortMenuRef}
              className="floating-menu-popover"
              role="group"
              aria-label="Sort skins"
            >
              {MUSEUM_SORTS.map((s) => {
                const Icon = SORT_ICONS[s];
                return (
                  <button
                    key={s}
                    type="button"
                    className="floating-menu-item grid-sort-item"
                    aria-pressed={s === sort}
                    onClick={() => chooseSort(s)}
                  >
                    <Icon size={18} aria-hidden />
                    <span>{SORT_LABELS[s]}</span>
                    {s === sort && (
                      <Check
                        size={16}
                        className="grid-sort-check"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {inputValue === "" && (
            <button
              type="button"
              className="grid-sort-button"
              aria-label={`Sort: ${SORT_LABELS[sort]}`}
              title="Sort skins"
              aria-expanded={sortOpen}
              aria-controls="grid-sort-menu"
              ref={sortButtonRef}
              // Leaves focus where it was, like the clear button.
              onPointerDown={(e) => e.preventDefault()}
              onClick={toggleSort}
            >
              <span>{SORT_LABELS[sort]}</span>
              <ArrowUpDown size={16} strokeWidth={2.25} aria-hidden />
            </button>
          )}
          {inputValue !== "" && (
            <button
              type="button"
              className="grid-search-clear"
              aria-label="Clear search"
              title="Clear search"
              // Leaves focus where it was, so a tap doesn't summon the
              // keyboard on mobile.
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => {
                const viaKeyboard = document.activeElement === e.currentTarget;
                setInputValue("");
                // The button goes away, so focus would otherwise fall to the
                // page.
                if (viaKeyboard) searchInputRef.current?.focus();
              }}
            >
              <X size={16} strokeWidth={2.5} aria-hidden />
            </button>
          )}
        </div>
      </FloatingBar>

      {showSearchResults && searchError && (
        <div className="grid-message grid-message-error">{searchError}</div>
      )}
      {showSearchResults && !searchError && skins.length === 0 && (
        <div className="grid-message">
          No results found for &quot;{resultsQuery}&quot;
        </div>
      )}

      {/* Grid - show when browsing or when we have results (even while pending) */}
      {windowSize != null &&
        (!showSearchResults || (!searchError && skins.length > 0)) && (
          <Grid
            ref={gridRef}
            itemKey={itemKey}
            itemData={itemData}
            columnCount={columnCount}
            columnWidth={columnWidth}
            height={windowHeight}
            rowCount={Math.ceil(total / columnCount)}
            rowHeight={rowHeight}
            width={windowWidth}
            overscanRowCount={5}
            onScroll={onScroll}
            initialScrollTop={initialScrollTop}
            onItemsRendered={onItemsRendered}
            style={{ overflowY: "scroll" }}
          >
            {Cell}
          </Grid>
        )}
    </div>
  );
}

// A key for the current history entry, kept in its state, so a grid can
// remember things about this visit to it and find them again on Back.
function useHistoryEntryKey(): string | null {
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => {
    let entryKey: string | undefined = window.history.state?.gridEntryKey;
    if (entryKey == null) {
      entryKey = crypto.randomUUID();
      replaceHistoryEntry({ gridEntryKey: entryKey });
    }
    setKey(entryKey);
  }, []);
  return key;
}

/**
 * Update the current history entry's state (keeping our key), and its URL if
 * given.
 *
 * With a new URL, only our own state is passed: Next.js adds its own back, and
 * given its keys it would assume the update was its own and not learn the new
 * URL, then put its old one back on the entry (so Back would lose the search).
 * Without one, Next's keys are kept: there's nothing for it to learn, and this
 * can run before Next is listening (child effects run first), when it
 * couldn't add them back.
 */
function replaceHistoryEntry(
  state: { gridEntryKey?: string },
  url?: string
): void {
  const current = window.history.state;
  if (url == null) {
    window.history.replaceState({ ...current, ...state }, "");
  } else {
    window.history.replaceState(
      { gridEntryKey: current?.gridEntryKey, ...state },
      "",
      url
    );
  }
}
