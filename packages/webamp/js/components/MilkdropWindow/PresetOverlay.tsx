import { useState, useCallback, useMemo } from "react";
import { promptForFileReferences } from "../../fileUtils";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { clamp } from "../../utils";
import { TransitionType } from "../../types";
import {
  useUnmountedRef,
  useActionCreator,
  useTypedSelector,
} from "../../hooks";

const ENTRY_HEIGHT = 14;
const HEIGHT_PADDING = 15;
const WIDTH_PADDING = 20;

const LOADING_STYLE: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  color: "white",
  background: "rgba(0.33, 0.33, 0.33, 0.33)",
};

const OUTER_WRAPPER_STYLE: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  padding: "15px 10px 0 10px",
};

const INNER_WRAPPER_STYLE: React.CSSProperties = {
  display: "inline-block",
  whiteSpace: "nowrap",
  overflow: "hidden",
  background: "rgba(0, 0, 0, 0.815)",
  fontSize: "12px",
};

interface Props {
  height: number;
  width: number;
}

export interface PresetItem {
  type: "LOCAL_DIR" | "PRESET";
  presetIndex: number;
  label: string;
}

export function getFilteredItems(
  presetKeys: string[] | null,
  searchQuery: string
): PresetItem[] {
  if (presetKeys == null) {
    return [];
  }
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    const items: PresetItem[] = [
      { type: "LOCAL_DIR", presetIndex: -1, label: "Load Local Directory" },
    ];
    for (let i = 0; i < presetKeys.length; i++) {
      items.push({ type: "PRESET", presetIndex: i, label: presetKeys[i] });
    }
    return items;
  }

  const items: PresetItem[] = [];
  for (let i = 0; i < presetKeys.length; i++) {
    if (presetKeys[i].toLowerCase().includes(query)) {
      items.push({ type: "PRESET", presetIndex: i, label: presetKeys[i] });
    }
  }
  return items;
}

export function highlightMatch(text: string, query: string): React.ReactNode {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) {
    return text;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + trimmed.length);
  const after = text.slice(index + trimmed.length);

  return (
    <>
      {before}
      <span
        style={{
          textDecoration: "underline",
          fontWeight: "bold",
          color: "#FFFFFF",
        }}
      >
        {match}
      </span>
      {after}
    </>
  );
}

function PresetOverlay({ height, width }: Props) {
  const presetKeys = useTypedSelector(Selectors.getPresetNames);
  const currentPresetIndex = useTypedSelector(Selectors.getCurrentPresetIndex);
  const requestPresetAtIndex = useActionCreator(Actions.requestPresetAtIndex);
  const togglePresetOverlay = useActionCreator(Actions.togglePresetOverlay);
  const appendPresetFileList = useActionCreator(Actions.appendPresetFileList);

  const unmountedRef = useUnmountedRef();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(
    () => getFilteredItems(presetKeys, searchQuery),
    [presetKeys, searchQuery]
  );

  const [selectedListIndex, setSelectedListIndex] = useState(() => {
    if (currentPresetIndex != null) {
      return currentPresetIndex + 1;
    }
    return 0;
  });

  const loadLocalDir = useCallback(async () => {
    const fileReferences = await promptForFileReferences({ directory: true });
    if (unmountedRef.current) {
      return;
    }
    appendPresetFileList(fileReferences);
  }, [appendPresetFileList, unmountedRef]);

  const selectItem = useCallback(
    (item: PresetItem) => {
      if (item.type === "LOCAL_DIR") {
        loadLocalDir();
      } else {
        requestPresetAtIndex(item.presetIndex, TransitionType.DEFAULT, true);
      }
    },
    [loadLocalDir, requestPresetAtIndex]
  );

  const handleFocusedKeyboardInput = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const maxIndex = Math.max(0, filteredItems.length - 1);

      switch (e.keyCode) {
        case 38: // up arrow
          setSelectedListIndex((value) => Math.max(value - 1, 0));
          e.stopPropagation();
          e.preventDefault();
          return;
        case 40: // down arrow
          setSelectedListIndex((value) => Math.min(value + 1, maxIndex));
          e.stopPropagation();
          e.preventDefault();
          return;
        case 33: // page up
          setSelectedListIndex((value) => Math.max(value - 10, 0));
          e.stopPropagation();
          e.preventDefault();
          return;
        case 34: // page down
          setSelectedListIndex((value) => Math.min(value + 10, maxIndex));
          e.stopPropagation();
          e.preventDefault();
          return;
        case 13: // enter
          if (filteredItems.length > 0 && selectedListIndex <= maxIndex) {
            selectItem(filteredItems[selectedListIndex]);
          }
          e.stopPropagation();
          e.preventDefault();
          return;
        case 27: // escape
          if (searchQuery.length > 0) {
            setSearchQuery("");
            setSelectedListIndex(0);
          } else {
            togglePresetOverlay();
          }
          e.stopPropagation();
          e.preventDefault();
          return;
        case 8: // backspace
          if (searchQuery.length > 0) {
            setSearchQuery((prev) => prev.slice(0, -1));
            setSelectedListIndex(0);
            e.stopPropagation();
            e.preventDefault();
          }
          return;
      }

      // Printable character typeahead filtering
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !(e.key === " " && searchQuery.length === 0)
      ) {
        setSearchQuery((prev) => prev + e.key);
        setSelectedListIndex(0);
        e.stopPropagation();
        e.preventDefault();
      }
    },
    [
      filteredItems,
      searchQuery,
      selectedListIndex,
      selectItem,
      togglePresetOverlay,
    ]
  );

  const renderList = useCallback(() => {
    if (filteredItems.length === 0) {
      return (
        <li
          style={{
            color: "#888888",
            fontStyle: "italic",
            lineHeight: `${ENTRY_HEIGHT}px`,
            padding: "2px 4px",
          }}
        >
          No matching presets
        </li>
      );
    }

    const maxVisibleRows = Math.floor((height - HEIGHT_PADDING) / ENTRY_HEIGHT);
    const searchHeaderOffset = searchQuery.trim() ? 2 : 0;
    const rowsToShow = Math.max(
      1,
      Math.floor(maxVisibleRows * 0.75) - searchHeaderOffset
    );

    const [startIndex, endIndex] = getRangeCenteredOnIndex(
      filteredItems.length,
      rowsToShow,
      selectedListIndex
    );

    const presetElms = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const item = filteredItems[i];
      const isSelected = i === selectedListIndex;
      const isCurrent =
        item.type === "PRESET" && item.presetIndex === currentPresetIndex;

      let color: string;
      if (isSelected) {
        color = isCurrent ? "#FFCC22" : "#FF5050";
      } else {
        color = isCurrent ? "#CCFF03" : "#CCCCCC";
      }

      presetElms.push(
        <li
          key={`${item.type}-${item.presetIndex}-${i}`}
          onClick={() => selectItem(item)}
          style={{
            color,
            lineHeight: `${ENTRY_HEIGHT}px`,
            cursor: "pointer",
          }}
        >
          {item.type === "LOCAL_DIR"
            ? item.label
            : highlightMatch(item.label, searchQuery)}
        </li>
      );
    }

    return presetElms;
  }, [
    currentPresetIndex,
    filteredItems,
    height,
    searchQuery,
    selectedListIndex,
    selectItem,
  ]);

  const handleNode = useCallback((node: HTMLDivElement | null) => {
    if (node != null && document.activeElement !== node) {
      node.focus();
    }
  }, []);

  if (presetKeys == null) {
    return (
      <div style={LOADING_STYLE}>
        <span>Loading presets</span>
      </div>
    );
  }

  return (
    <div
      ref={handleNode}
      tabIndex={-1}
      style={OUTER_WRAPPER_STYLE}
      onKeyDown={handleFocusedKeyboardInput}
    >
      <div
        style={{
          ...INNER_WRAPPER_STYLE,
          width: width - 20 - WIDTH_PADDING,
          maxHeight: height - HEIGHT_PADDING,
        }}
      >
        {searchQuery.trim().length > 0 && (
          <div
            style={{
              padding: "2px 6px",
              borderBottom: "1px solid #444444",
              background: "rgba(20, 20, 20, 0.9)",
              color: "#FFCC22",
              fontSize: "11px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              Search: <span style={{ color: "#FFFFFF" }}>{searchQuery}</span>
              <span style={{ opacity: 0.7 }}>_</span>
            </span>
            <span style={{ color: "#888888", fontSize: "10px" }}>
              {filteredItems.length} match
              {filteredItems.length === 1 ? "" : "es"}
            </span>
          </div>
        )}
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {renderList()}
        </ul>
      </div>
    </div>
  );
}

// Find a tuple `[startIndex, endIndex]` representing start/end indexes into an
// array of length `length`, that descripe a range of size up to `rangeSize`
// where a best effort is made to center `indexToCenter`.
export function getRangeCenteredOnIndex(
  length: number,
  maxRangeSize: number,
  indexToCenter: number
): [number, number] {
  if (length <= 0) {
    return [0, -1];
  }
  const rangeSize = Math.min(length, maxRangeSize);
  const halfRangeSize = Math.floor(rangeSize / 2);
  const idealStartIndex = indexToCenter - halfRangeSize;
  const startIndex = clamp(idealStartIndex, 0, length - rangeSize);
  const endIndex = startIndex + rangeSize - 1;
  return [startIndex, endIndex];
}

export default PresetOverlay;
