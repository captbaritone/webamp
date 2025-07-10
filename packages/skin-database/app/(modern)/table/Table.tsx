"use client";
import {
  HEADING_HEIGHT,
  SCREENSHOT_WIDTH,
  SKIN_RATIO,
} from "../../../legacy-client/src/constants.js";
import {
  useScrollbarWidth,
  useWindowSize,
} from "../../../legacy-client/src/hooks.js";
import React, { useEffect, useMemo, useState } from "react";
import { FixedSizeGrid as Grid } from "react-window";

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}

export default function WrappedTable({ initialSkins, skinCount }) {
  return (
    <ClientOnly>
      <Table initialSkins={initialSkins} skinCount={skinCount} />
    </ClientOnly>
  );
}

function Table({ initialSkins, skinCount }) {
  const skins = initialSkins;

  const scale = 0.5; // This can be adjusted based on your needs
  function getSkinData(data: {
    columnIndex: number;
    rowIndex: number;
    columnCount: number;
  }) {
    const index = data.rowIndex * columnCount + data.columnIndex;
    const skin = skins[index];
    return { requestToken: skin?.md5, skin };
  }
  const scrollbarWidth = useScrollbarWidth();
  const { windowWidth: windowWidthWithScrollabar, windowHeight } =
    useWindowSize();

  const { columnWidth, rowHeight, columnCount } = getTableDimensions(
    windowWidthWithScrollabar - scrollbarWidth,
    scale
  );
  function Cell(props) {
    const index = props.rowIndex * columnCount + props.columnIndex;
    const skin = skins[index];
    if (skin == null) {
      if (index < skinCount) {
        // Fetch more skins!
      }
      return <div style={props.style}></div>;
    }
    if (skin == null) {
      return <div style={props.style}>Loading...</div>;
    }
    const imageUrl = `https://r2.webampskins.org/screenshots/${skin.md5}.png`;
    return (
      <div style={props.style}>
        <img
          src={imageUrl}
          style={{ width: props.data.width, height: props.data.height }}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <SkinTableUnbound
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowHeight={rowHeight}
        windowHeight={windowHeight}
        windowWidth={windowWidthWithScrollabar}
        skinCount={skinCount}
        getSkinData={getSkinData}
        Cell={Cell}
      />
    </div>
  );
}
const getTableDimensions = (windowWidth: number, scale: number) => {
  const columnCount = Math.round(windowWidth / (SCREENSHOT_WIDTH * scale));
  const columnWidth = windowWidth / columnCount; // TODO: Consider flooring this to get things aligned to the pixel
  const rowHeight = columnWidth * SKIN_RATIO;
  return { columnWidth, rowHeight, columnCount };
};

function SkinTableUnbound({
  columnCount,
  columnWidth,
  rowHeight,
  windowHeight,
  skinCount,
  windowWidth,
  getSkinData,
  Cell,
}) {
  function itemKey({ columnIndex, rowIndex }) {
    const { requestToken, data: skin } = getSkinData({
      columnIndex,
      rowIndex,
      columnCount,
    });
    if (skin == null && requestToken == null) {
      return `empty-cell-${columnIndex}-${rowIndex}`;
    }
    return skin ? skin.hash : `unfectched-index-${requestToken}`;
  }
  const gridRef = React.useRef();
  const itemRef = React.useRef();
  React.useLayoutEffect(() => {
    if (gridRef.current == null) {
      return;
    }
    gridRef.current.scrollTo({ scrollLeft: 0, scrollTop: 0 });
  }, [skinCount]);

  React.useLayoutEffect(() => {
    if (gridRef.current == null) {
      return;
    }

    const itemRow = Math.floor(itemRef.current / columnCount);

    gridRef.current.scrollTo({ scrollLeft: 0, scrollTop: rowHeight * itemRow });
  }, [rowHeight, columnCount]);

  const onScroll = useMemo(() => {
    const half = Math.round(columnCount / 2);
    return (scrollData) => {
      itemRef.current =
        Math.round(scrollData.scrollTop / rowHeight) * columnCount + half;
    };
  }, [columnCount, rowHeight]);

  return (
    <div id="infinite-skins" style={{ marginTop: HEADING_HEIGHT }}>
      <Grid
        ref={gridRef}
        itemKey={itemKey}
        itemData={{ columnCount, width: columnWidth, height: rowHeight }}
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={windowHeight - HEADING_HEIGHT}
        rowCount={Math.ceil(skinCount / columnCount)}
        rowHeight={rowHeight}
        width={windowWidth}
        overscanRowCount={5}
        onScroll={onScroll}
        style={{ overflowY: "scroll" }}
      >
        {Cell}
      </Grid>
    </div>
  );
}
