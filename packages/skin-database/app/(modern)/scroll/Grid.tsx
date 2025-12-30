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
} from "../../../legacy-client/src/constants";
import { getMuseumPageSkins, GridSkin } from "./getMuseumPageSkins";

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

  // Initialize state with server-provided data
  const [skins, setSkins] = useState<GridSkin[]>(initialSkins);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));
  const isLoadingRef = useRef(false);

  const columnCount = Math.round(windowWidth / (SCREENSHOT_WIDTH * 0.9));
  const columnWidth = windowWidth / columnCount;
  const rowHeight = columnWidth * SKIN_RATIO;
  const pageSize = 50; // Number of skins to load per page

  const loadMoreSkins = useCallback(
    async (startIndex: number) => {
      const pageNumber = Math.floor(startIndex / pageSize);

      // Don't reload if we already have this page
      if (loadedPages.has(pageNumber) || isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      try {
        const offset = pageNumber * pageSize;
        const newSkins = await getMuseumPageSkins(offset, pageSize);
        setSkins((prev) => [...prev, ...newSkins]);
        setLoadedPages((prev) => new Set([...prev, pageNumber]));
      } catch (error) {
        console.error("Failed to load skins:", error);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [loadedPages, pageSize]
  );

  function itemKey({
    columnIndex,
    rowIndex,
  }: {
    columnIndex: number;
    rowIndex: number;
  }) {
    const index = rowIndex * columnCount + columnIndex;
    const skin = skins[index];
    return skin ? skin.md5 : `empty-cell-${columnIndex}-${rowIndex}`;
  }

  const gridRef = React.useRef<any>(null);
  const itemRef = React.useRef<number>(0);

  const onScroll = useMemo(() => {
    const half = Math.round(columnCount / 2);
    return (scrollData: { scrollTop: number }) => {
      itemRef.current =
        Math.round(scrollData.scrollTop / rowHeight) * columnCount + half;
    };
  }, [columnCount, rowHeight, loadMoreSkins]);

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
      <Grid
        ref={gridRef}
        itemKey={itemKey}
        itemData={itemData}
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={windowHeight}
        rowCount={Math.ceil(initialTotal / columnCount)}
        rowHeight={rowHeight}
        width={windowWidth}
        overscanRowsCount={5}
        onScroll={onScroll}
        style={{ overflowY: "scroll" }}
      >
        {Cell}
      </Grid>
    </div>
  );
}
