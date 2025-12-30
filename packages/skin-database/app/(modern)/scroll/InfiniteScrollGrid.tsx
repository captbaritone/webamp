"use client";

import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
  memo,
} from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { useRouter } from "next/navigation";
import { ClientSkin } from "./SkinScroller";
import {
  SCREENSHOT_WIDTH,
  SKIN_RATIO,
} from "../../../legacy-client/src/constants";

type Props = {
  initialSkins: ClientSkin[];
  getSkins: (sessionId: string, offset: number) => Promise<ClientSkin[]>;
  sessionId: string;
};

type CellProps = {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    skins: ClientSkin[];
    columnCount: number;
    requestSkinsIfNeeded: (index: number) => void;
  };
};

// Extract Cell as a separate component so we can use hooks
const GridCell = memo(({ columnIndex, rowIndex, style, data }: CellProps) => {
  const { skins, columnCount, requestSkinsIfNeeded } = data;
  const router = useRouter();
  const index = rowIndex * columnCount + columnIndex;
  const skin = skins[index];

  // Request more skins if this cell needs data
  useEffect(() => {
    if (!skin) {
      requestSkinsIfNeeded(index);
    }
  }, [skin, index, requestSkinsIfNeeded]);

  if (!skin) {
    return <div style={style} />;
  }

  return (
    <div
      style={{
        ...style,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        padding: "2px",
        boxSizing: "border-box",
        cursor: "pointer",
      }}
      onClick={() => {
        router.push(`/scroll/skin/${skin.md5}`);
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <img
          src={skin.screenshotUrl}
          alt={skin.fileName}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            imageRendering: "pixelated",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
});

GridCell.displayName = "GridCell";

// Calculate grid dimensions based on window width
// Skins will be scaled to fill horizontally across multiple columns
function getGridDimensions(windowWidth: number) {
  const scale = 1.0; // Can be adjusted for different sizes
  const columnCount = Math.max(
    1,
    Math.floor(windowWidth / (SCREENSHOT_WIDTH * scale))
  );
  const columnWidth = windowWidth / columnCount;
  const rowHeight = columnWidth * SKIN_RATIO;
  return { columnWidth, rowHeight, columnCount };
}

export default function InfiniteScrollGrid({
  initialSkins,
  getSkins,
  sessionId,
}: Props) {
  const [skins, setSkins] = useState<ClientSkin[]>(initialSkins);
  const [fetching, setFetching] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const gridRef = useRef<Grid>(null);
  const requestedIndicesRef = useRef<Set<number>>(new Set());

  // Track window size
  useLayoutEffect(() => {
    function updateSize() {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Scroll to top when window width changes (column count changes)
  useEffect(() => {
    if (gridRef.current && windowWidth > 0) {
      gridRef.current.scrollTo({ scrollLeft: 0, scrollTop: 0 });
    }
  }, [windowWidth]);

  // Function to request more skins when a cell needs data
  const requestSkinsIfNeeded = useCallback(
    (index: number) => {
      // Only fetch if this index is beyond our current data
      if (index >= skins.length) {
        // Calculate which batch this index belongs to
        const batchSize = 50; // Fetch in batches
        const batchStart = Math.floor(skins.length / batchSize) * batchSize;

        // Only fetch if we haven't already requested this batch
        if (!requestedIndicesRef.current.has(batchStart) && !fetching) {
          requestedIndicesRef.current.add(batchStart);
          setFetching(true);
          getSkins(sessionId, batchStart)
            .then((newSkins) => {
              setSkins((prevSkins) => [...prevSkins, ...newSkins]);
              setFetching(false);
            })
            .catch(() => {
              requestedIndicesRef.current.delete(batchStart);
              setFetching(false);
            });
        }
      }
    },
    [skins.length, fetching, sessionId, getSkins]
  );

  const { columnWidth, rowHeight, columnCount } =
    getGridDimensions(windowWidth);

  if (windowWidth === 0 || windowHeight === 0) {
    return null; // Don't render until we have window dimensions
  }

  const rowCount = Math.ceil(skins.length / columnCount);

  const itemData = {
    skins,
    columnCount,
    requestSkinsIfNeeded,
  };

  return (
    <div style={{ backgroundColor: "#1a1a1a" }}>
      <Grid
        ref={gridRef}
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={windowHeight}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={windowWidth}
        itemData={itemData}
        overscanRowCount={2}
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
        }}
        className="hide-scrollbar"
      >
        {GridCell}
      </Grid>
    </div>
  );
}
