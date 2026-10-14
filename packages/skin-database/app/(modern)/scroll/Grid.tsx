"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  // @ts-expect-error - unstable_ViewTransition is not yet in @types/react
  unstable_ViewTransition as ViewTransition,
  useEffect,
} from "react";

import Link from "next/link";
import { FixedSizeGrid as Grid } from "react-window";
import { useWindowSize } from "../../../legacy-client/src/hooks";
import {
  SCREENSHOT_WIDTH,
  SKIN_RATIO,
  MOBILE_MAX_WIDTH,
} from "../../../legacy-client/src/constants";
import { getMuseumPageSkins, GridSkin } from "./getMuseumPageSkins";
import {
  algoliaSearch,
  graphqlSearch,
  USE_ALGOLIA,
} from "../../../legacy-client/src/algolia";
import { getSearchDebounceMs } from "../../../legacy-client/src/searchConfig";

// Simple utility to get screenshot URL (avoiding server-side import)
function getScreenshotUrl(md5: string): string {
  return `https://r2.webampskins.org/screenshots/${md5}.png`;
}

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
  const index = rowIndex * columnCount + columnIndex;
  const skin = skins[index];

  if (!skin) {
    return null;
  }

  return (
    <div style={style}>
      <div style={{ width, height, position: "relative" }}>
        <Link href={`/scroll/skin/${skin.md5}`}>
          <ViewTransition name={`skin-${skin.md5}`}>
            <img
              src={skin.screenshotUrl}
              alt={skin.fileName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </ViewTransition>
        </Link>
        {skin.nsfw && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
            }}
          >
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
};

export default function SkinTable({
  initialSkins,
  initialTotal,
}: SkinTableProps) {
  const { windowWidth, windowHeight } = useWindowSize();

  // Search input state - separate input value from actual search query
  const [inputValue, setInputValue] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });

  // State for browsing mode. A sparse array indexed by position in the museum,
  // so pages land in the right place even if they load out of order.
  const [browseSkins, setBrowseSkins] =
    useState<Array<GridSkin | undefined>>(initialSkins);
  const loadedPagesRef = useRef<Set<number>>(new Set([0]));
  const inFlightPagesRef = useRef<Set<number>>(new Set());

  // State for search mode
  const [searchSkins, setSearchSkins] = useState<GridSkin[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  // The query that `searchSkins`/`searchError` are the outcome of. Until it
  // matches the input, a search is pending (debouncing or in flight).
  const [resultsQuery, setResultsQuery] = useState<string | null>(null);

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
      query === ""
        ? "/scroll/"
        : `/scroll/?${new URLSearchParams({ q: inputValue })}`;
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      "",
      newUrl
    );

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
            screenshotUrl: getScreenshotUrl(hit.objectID),
            fileName: hit.fileName,
            // Some records still have float scores rather than booleans.
            nsfw: hit.nsfw === true || hit.nsfw === 1,
          }))
        );
        setSearchError(null);
        setResultsQuery(query);
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

  const onItemsRendered = useCallback(
    ({
      overscanRowStartIndex,
      overscanRowStopIndex,
    }: {
      overscanRowStartIndex: number;
      overscanRowStopIndex: number;
    }) => {
      if (showSearchResults) {
        return;
      }
      const firstIndex = overscanRowStartIndex * columnCount;
      const lastIndex = (overscanRowStopIndex + 1) * columnCount - 1;
      for (
        let page = Math.floor(firstIndex / PAGE_SIZE);
        page <= Math.floor(lastIndex / PAGE_SIZE);
        page++
      ) {
        loadPage(page);
      }
    },
    [showSearchResults, columnCount, loadPage]
  );

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

  const onScroll = useMemo(() => {
    const half = Math.round(columnCount / 2);
    return (scrollData: { scrollTop: number }) => {
      itemRef.current =
        Math.round(scrollData.scrollTop / rowHeight) * columnCount + half;
    };
  }, [columnCount, rowHeight]);

  const itemData: CellData = useMemo(
    () => ({
      skins,
      columnCount,
      width: columnWidth,
      height: rowHeight,
    }),
    [skins, columnCount, columnWidth, rowHeight]
  );

  return (
    <div id="infinite-skins">
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
            value={inputValue}
            onChange={handleSearchChange}
            placeholder="Search skins..."
            aria-label="Search skins"
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
      {(!showSearchResults || (!searchError && skins.length > 0)) && (
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
