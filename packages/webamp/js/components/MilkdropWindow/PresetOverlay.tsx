import { useState, useCallback } from "react";
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

function presetIndexFromListIndex(listIndex: number) {
  return listIndex - 1;
}

function listIndexFromPresetIndex(listIndex: number) {
  return listIndex + 1;
}

function PresetOverlay({ height, width }: Props) {
  const presetKeys = useTypedSelector(Selectors.getPresetNames);
  const currentPresetIndex = useTypedSelector(Selectors.getCurrentPresetIndex);
  const requestPresetAtIndex = useActionCreator(Actions.requestPresetAtIndex);
  const togglePresetOverlay = useActionCreator(Actions.togglePresetOverlay);
  const appendPresetFileList = useActionCreator(Actions.appendPresetFileList);

  const unmountedRef = useUnmountedRef();
  const [selectedListIndex, setSelectedListIndex] = useState(() => {
    if (currentPresetIndex != null) {
      return listIndexFromPresetIndex(currentPresetIndex);
    }
    return 0;
  });

  // Number of presets, plus one for the "Load Local Directory" option, minus
  // one to convert a length to an index.
  const maxListIndex = presetKeys.length; // - 1 + 1;

  const renderList = useCallback(() => {
    const maxVisibleRows = Math.floor((height - HEIGHT_PADDING) / ENTRY_HEIGHT);
    const rowsToShow = Math.floor(maxVisibleRows * 0.75); // Only fill 3/4 of the screen.
    const [startIndex, endIndex] = getRangeCenteredOnIndex(
      maxListIndex + 1, // Add one to convert an index to a length
      rowsToShow,
      selectedListIndex
    );

    const presetElms = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const presetIndex = presetIndexFromListIndex(i);
      const isSelected = i === selectedListIndex;
      const isCurrent = presetIndex === currentPresetIndex;
      let color: string;
      if (isSelected) {
        color = isCurrent ? "#FFCC22" : "#FF5050";
      } else {
        color = isCurrent ? "#CCFF03" : "#CCCCCC";
      }
      presetElms.push(
        <li key={i} style={{ color, lineHeight: `${ENTRY_HEIGHT}px` }}>
          {i === 0 ? "Load Local Directory" : presetKeys[presetIndex]}
        </li>
      );
    }

    return presetElms;
  }, [currentPresetIndex, height, maxListIndex, presetKeys, selectedListIndex]);

  const loadLocalDir = useCallback(async () => {
    const fileReferences = await promptForFileReferences({ directory: true });
    if (unmountedRef.current) {
      return;
    }
    appendPresetFileList(fileReferences);
  }, [appendPresetFileList, unmountedRef]);

  const handleFocusedKeyboardInput = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.keyCode) {
        case 38: // up arrow
          setSelectedListIndex((value) => Math.max(value - 1, 0));
          e.stopPropagation();
          break;
        case 40: // down arrow
          setSelectedListIndex((value) => Math.min(value + 1, maxListIndex));
          e.stopPropagation();
          break;
        case 13: // enter
          if (selectedListIndex === 0) {
            loadLocalDir();
          } else {
            requestPresetAtIndex(
              presetIndexFromListIndex(selectedListIndex),
              TransitionType.DEFAULT,
              true
            );
          }
          e.stopPropagation();
          break;
        case 27: // escape
          togglePresetOverlay();
          e.stopPropagation();
          break;
      }
    },
    [
      loadLocalDir,
      maxListIndex,
      requestPresetAtIndex,
      selectedListIndex,
      togglePresetOverlay,
    ]
  );

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
  const rangeSize = Math.min(length, maxRangeSize);
  const halfRangeSize = Math.floor(rangeSize / 2);
  const idealStartIndex = indexToCenter - halfRangeSize;
  const startIndex = clamp(idealStartIndex, 0, length - rangeSize);
  const endIndex = startIndex + rangeSize - 1;
  return [startIndex, endIndex];
}
export default PresetOverlay;
