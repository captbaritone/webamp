"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  // @ts-expect-error - unstable_ViewTransition is not yet in @types/react
  unstable_ViewTransition as ViewTransition,
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
import { searchSkins as performAlgoliaSearch } from "./algoliaClient";

// Simple utility to get screenshot URL (avoiding server-side import)
function getScreenshotUrl(md5: string): string {
  return `https://r2.webampskins.org/screenshots/${md5}.png`;
}

type CellData = {
  skins: GridSkin[];
  columnCount: number;
  width: number;
  height: number;
  loadMoreSkins: (startIndex: number) => Promise<void>;
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
  data.loadMoreSkins(index);
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
  const [inputValue, setInputValue] = useState("");

  // State for browsing mode
  const [browseSkins, setBrowseSkins] = useState<GridSkin[]>(initialSkins);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));
  const isLoadingRef = useRef(false);

  // State for search mode
  const [searchSkins, setSearchSkins] = useState<GridSkin[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [_, setSearchIsPending] = useState(false);

  // Debounce timer ref

  // Determine which mode we're in based on actual search query, not input
  const isSearchMode = inputValue.trim().length > 0;
  const skins = isSearchMode ? searchSkins : browseSkins;
  const total = isSearchMode ? searchSkins.length : initialTotal;

  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);

    // If query is empty, clear results immediately
    if (!query || query.trim().length === 0) {
      return;
      // setSearchQuery("");
      startTransition(() => {
        setSearchSkins([]);
        setSearchError(null);
      });
      return;
    }
    // return;

    try {
      setSearchIsPending(true);
      const result = await performAlgoliaSearch(query);
      const hits = result.hits as Array<{
        objectID: string;
        fileName: string;
        nsfw?: boolean;
      }>;
      const searchResults: GridSkin[] = hits.map((hit) => ({
        md5: hit.objectID,
        screenshotUrl: getScreenshotUrl(hit.objectID),
        fileName: hit.fileName,
        nsfw: hit.nsfw ?? false,
      }));
      setSearchSkins(searchResults);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError("Search failed. Please try again.");
      setSearchSkins([]);
    } finally {
      setSearchIsPending(false);
    }
  };

  const columnCount = Math.round(windowWidth / (SCREENSHOT_WIDTH * 0.9));
  const columnWidth = windowWidth / columnCount;
  const rowHeight = columnWidth * SKIN_RATIO;
  const pageSize = 50; // Number of skins to load per page

  const loadMoreSkins = useCallback(
    async (startIndex: number) => {
      // Don't load more in search mode
      if (isSearchMode) {
        return;
      }

      const pageNumber = Math.floor(startIndex / pageSize);

      // Don't reload if we already have this page
      if (loadedPages.has(pageNumber) || isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      try {
        const offset = pageNumber * pageSize;
        const newSkins = await getMuseumPageSkins(offset, pageSize);
        setBrowseSkins((prev) => [...prev, ...newSkins]);
        setLoadedPages((prev) => new Set([...prev, pageNumber]));
      } catch (error) {
        console.error("Failed to load skins:", error);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [loadedPages, pageSize, isSearchMode]
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
      loadMoreSkins,
    }),
    [skins, columnCount, columnWidth, rowHeight, loadMoreSkins]
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
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              paddingRight: "1rem",
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
        </div>
      </div>

      {/* Error State */}
      {isSearchMode && searchError && (
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
      {isSearchMode && !searchError && skins.length === 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: windowHeight,
            color: "#ccc",
          }}
        >
          No results found for &quot;{inputValue}&quot;
        </div>
      )}

      {/* Grid - show when browsing or when we have results (even while pending) */}
      {(!isSearchMode || (!searchError && skins.length > 0)) && (
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
          overscanRowsCount={5}
          onScroll={onScroll}
          style={{ overflowY: "scroll" }}
        >
          {Cell}
        </Grid>
      )}
    </div>
  );
}
