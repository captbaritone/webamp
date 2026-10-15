"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  // @ts-expect-error - unstable_ViewTransition is not yet in @types/react
  unstable_ViewTransition as ViewTransition,
  useEffect,
  useLayoutEffect,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FixedSizeGrid as Grid } from "react-window";
import {
  SCREENSHOT_WIDTH,
  SKIN_RATIO,
  MOBILE_MAX_WIDTH,
} from "../../../legacy-client/src/constants";
import { getMuseumPageSkins, GridSkin } from "./getMuseumPageSkins";
import {
  createEventLogger,
  flushWhenHidden,
  getVisitContext,
  setFeedEntry,
} from "./eventLogger";
import {
  algoliaSearch,
  graphqlSearch,
  USE_ALGOLIA,
} from "../../../legacy-client/src/algolia";
import { getSearchDebounceMs } from "../../../legacy-client/src/searchConfig";
import { screenshotUrlFromHash } from "../../../legacy-client/src/utils";
import { skinPath } from "./paths";
import { normalizeSkinFileName } from "./skinFileName";
import { corsScreenshotUrl } from "./skinTint";
import HintPill, { markHintDone } from "./HintPill";
import { EyeOff, Pointer } from "lucide-react";
import { rememberSkinNsfw, useShowNsfw } from "./nsfwConsent";

// Remembered once the visitor has tapped a skin (see HintPill).
const GRID_HINT_KEY = "grid-hint-dismissed";

const PAGE_SIZE = 50;

// Same backends as the legacy museum search. If Algolia is enabled but
// failing (e.g. out of quota) fall back to our own SQLite FTS search.
async function runSearch(query: string): Promise<{
  hits: Array<{ objectID: string; fileName: string; nsfw?: any }>;
}> {
  if (USE_ALGOLIA) {
    try {
      return await algoliaSearch(query);
    } catch (error) {
      console.warn("Algolia search failed, falling back to SQLite", error);
    }
  }
  return graphqlSearch(query);
}

type CellData = {
  // Sparse: pages are written at their offset as they arrive.
  skins: Array<GridSkin | undefined>;
  columnCount: number;
  width: number;
  height: number;
  onSkinClick: (skinMd5: string, position: number) => void;
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
          onClick={() => {
            rememberSkinNsfw(skin.md5, skin.nsfw);
            data.onSkinClick(skin.md5, index);
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
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
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
  initialSkins: GridSkin[];
  initialTotal: number;
  // The search in the URL (?query=), if any.
  initialQuery: string;
  // That search's results, if the server ran it (initialSkins is then empty).
  initialSearchSkins: GridSkin[] | null;
};

// The window's size, or null until mounted. The grid is laid out to fit the
// window, so it isn't rendered on the server (or the first client render,
// which has to match it).
function useMountedWindowSize(): { width: number; height: number } | null {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );
  useLayoutEffect(() => {
    const update = () =>
      setSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

export default function SkinTable({
  initialSkins,
  initialTotal,
  initialQuery,
  initialSearchSkins,
}: SkinTableProps) {
  const windowSize = useMountedWindowSize();
  const windowWidth = windowSize?.width ?? 0;
  const windowHeight = windowSize?.height ?? 0;

  // Each grid visit is its own event-logging session. A feed session reached
  // from here records this ID, so a search and the skins opened from it can be
  // joined up.
  const [gridSessionId] = useState(() => crypto.randomUUID());
  const [logger] = useState(() => createEventLogger(gridSessionId));

  // Search input state - separate input value from actual search query
  // From the live URL rather than only the server's render: coming Back to a
  // search, the page can be the one first rendered without it.
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(
    () => searchParams.get("query") ?? initialQuery
  );
  // The server's results, if they're for the search we're starting with.
  const [serverResults] = useState(() =>
    initialSearchSkins != null && inputValue.trim() === initialQuery.trim()
      ? { query: initialQuery.trim(), skins: initialSearchSkins }
      : null
  );

  // State for browsing mode. A sparse array indexed by position in the museum,
  // so pages land in the right place even if they load out of order.
  const [browseSkins, setBrowseSkins] =
    useState<Array<GridSkin | undefined>>(initialSkins);
  const loadedPagesRef = useRef<Set<number>>(
    new Set(initialSkins.length > 0 ? [0] : [])
  );
  const inFlightPagesRef = useRef<Set<number>>(new Set());

  // State for search mode
  const [searchSkins, setSearchSkins] = useState<GridSkin[]>(
    serverResults?.skins ?? []
  );
  const [searchError, setSearchError] = useState<string | null>(null);
  // The query that `searchSkins`/`searchError` are the outcome of. Until it
  // matches the input, a search is pending (debouncing or in flight).
  const [resultsQuery, setResultsQuery] = useState<string | null>(
    serverResults?.query ?? null
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
  const total = showSearchResults ? searchSkins.length : initialTotal;

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const query = inputValue.trim();
    const newUrl =
      query === "" ? "/" : `/?${new URLSearchParams({ query: inputValue })}`;
    replaceHistoryEntry({}, newUrl);

    // Already showing this search's results (e.g. the server's).
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
        const result = await runSearch(query);
        if (cancelled) return;
        setSearchSkins(
          result.hits.map((hit) => ({
            md5: hit.objectID,
            screenshotUrl: screenshotUrlFromHash(hit.objectID),
            fileName: normalizeSkinFileName(hit.fileName),
            // Some records still have float scores rather than booleans.
            nsfw: hit.nsfw === true || hit.nsfw === 1,
          }))
        );
        setSearchError(null);
        setResultsQuery(query);
        logger.log({
          type: "grid_search",
          query,
          resultCount: result.hits.length,
        });
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

  const loadPage = useCallback(async (pageNumber: number) => {
    if (
      loadedPagesRef.current.has(pageNumber) ||
      inFlightPagesRef.current.has(pageNumber)
    ) {
      return;
    }
    inFlightPagesRef.current.add(pageNumber);
    try {
      const offset = pageNumber * PAGE_SIZE;
      const newSkins = await getMuseumPageSkins(offset, PAGE_SIZE);
      setBrowseSkins((prev) => {
        const next = prev.slice();
        newSkins.forEach((skin, i) => {
          next[offset + i] = skin;
        });
        return next;
      });
      loadedPagesRef.current.add(pageNumber);
    } catch (error) {
      // Leave the page unloaded so it's retried next time it's rendered.
      console.error("Failed to load skins:", error);
    } finally {
      inFlightPagesRef.current.delete(pageNumber);
    }
  }, []);

  // The rows the grid last rendered (including overscan).
  const renderedRowsRef = useRef<[number, number]>([0, 0]);
  const loadPagesForRows = useCallback(
    (firstRow: number, lastRow: number) => {
      const firstIndex = firstRow * columnCount;
      const lastIndex = (lastRow + 1) * columnCount - 1;
      for (
        let page = Math.floor(firstIndex / PAGE_SIZE);
        page <= Math.floor(lastIndex / PAGE_SIZE);
        page++
      ) {
        loadPage(page);
      }
    },
    [columnCount, loadPage]
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

  // Clearing a search shows the browse grid in the rows that were already on
  // screen, so onItemsRendered isn't called again; load their pages here.
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

  const gridRef = React.useRef<any>(null);
  const itemRef = React.useRef<number>(0);

  // Coming back to this grid (e.g. with the feed's back arrow) returns to the
  // skin you were looking at. The first visible skin is remembered per history
  // entry, as an index so it survives a change in column count.
  const scrollKey = useHistoryEntryKey();
  const restoreIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (scrollKey == null) return;
    try {
      const saved = sessionStorage.getItem(`grid-scroll:${scrollKey}`);
      if (saved != null) restoreIndexRef.current = Number(saved);
    } catch {
      // Start at the top.
    }
  }, [scrollKey]);

  const onScroll = useMemo(() => {
    const half = Math.round(columnCount / 2);
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    return (scrollData: { scrollTop: number }) => {
      const firstRow = Math.round(scrollData.scrollTop / rowHeight);
      itemRef.current = firstRow * columnCount + half;
      if (scrollKey == null || restoreIndexRef.current != null) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try {
          sessionStorage.setItem(
            `grid-scroll:${scrollKey}`,
            String(firstRow * columnCount)
          );
        } catch {
          // Not remembered; fine.
        }
      }, 150);
    };
  }, [columnCount, rowHeight, scrollKey]);

  // Restore once the skins we were scrolled to are what the grid shows: the
  // search's results, or the browse grid (whose pages load as they're
  // scrolled to).
  const showingRestoredContent = isSearchMode
    ? showSearchResults && !searchPending
    : true;
  useEffect(() => {
    const index = restoreIndexRef.current;
    if (index == null || windowSize == null || !showingRestoredContent) return;
    restoreIndexRef.current = null;
    gridRef.current?.scrollToItem({
      rowIndex: Math.floor(index / columnCount),
      align: "start",
    });
  }, [showingRestoredContent, windowSize, columnCount, scrollKey]);

  useEffect(() => {
    logger.log({
      type: "grid_open",
      query: inputValue.trim() || null,
      ...getVisitContext(),
    });
    if (serverResults != null) {
      logger.log({
        type: "grid_search",
        query: serverResults.query,
        resultCount: serverResults.skins.length,
      });
    }
    return flushWhenHidden(logger);
    // Only on mount: the search the grid was opened with.
  }, [logger]);

  // The search the visible results came from, for click events. A ref so
  // itemData (and every cell) doesn't change when it does.
  const activeQueryRef = useRef<string | null>(null);
  activeQueryRef.current = showSearchResults ? resultsQuery : null;

  // Keyboard shortcuts to jump to the search box: "/" (when not already typing
  // somewhere) and Cmd/Ctrl+K (from anywhere).
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    (skinMd5: string, position: number) => {
      logger.log({
        type: "grid_skin_click",
        skinMd5,
        position,
        query: activeQueryRef.current,
      });
      setFeedEntry("grid", gridSessionId);
      markHintDone(GRID_HINT_KEY);
    },
    [logger, gridSessionId]
  );

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
    <div id="infinite-skins">
      <HintPill
        storageKey={GRID_HINT_KEY}
        done={false}
        onShown={() => logger.log({ type: "grid_hint_shown" })}
        icon={<Pointer size={16} />}
        className="hint-pill-grid"
      >
        Tap a skin to try it in Webamp
      </HintPill>
      {/* Floating Search Bar */}
      <div
        style={{
          position: "fixed",
          bottom: "4.25rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 2rem)",
          maxWidth: MOBILE_MAX_WIDTH,
          padding: "0 1rem",
          zIndex: 998,
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            type="search"
            enterKeyHint="search"
            value={inputValue}
            onChange={handleSearchChange}
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
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              // Make room for the pending spinner.
              paddingRight: searchPending ? "2.75rem" : "1rem",
              fontSize: "1rem",
              backgroundColor: "rgba(26, 26, 26, 0.55)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "9999px",
              color: "#fff",
              outline: "none",
              fontFamily: "inherit",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              transition: "padding-right 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(26, 26, 26, 0.65)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(26, 26, 26, 0.55)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          />
          {searchPending && (
            <div
              className="search-spinner"
              role="status"
              aria-label="Searching"
            />
          )}
        </div>
      </div>

      {/* Error State */}
      {showSearchResults && searchError && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: windowHeight,
            color: "#ff6b6b",
          }}
        >
          {searchError}
        </div>
      )}

      {/* Empty Results */}
      {showSearchResults && !searchError && skins.length === 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: windowHeight,
            color: "#ccc",
          }}
        >
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
 * Update the current history entry's state (keeping what we've stored there)
 * and optionally its URL. Next.js's own keys are left out: given those, Next
 * assumes the update is its own and doesn't learn the new URL, then puts its
 * old one back on the entry, so Back would lose the search.
 */
function replaceHistoryEntry(
  state: Record<string, unknown>,
  url?: string
): void {
  const {
    __NA,
    __PRIVATE_NEXTJS_INTERNALS_TREE,
    as: _as,
    url: _url,
    ...ours
  } = window.history.state ?? {};
  window.history.replaceState({ ...ours, ...state }, "", url);
}
