import React from "react";
import { promptForFileReferences } from "../../fileUtils";
import { clamp } from "../../utils";

const ENTRY_HEIGHT = 14;
const HEIGHT_PADDING = 15;
const WIDTH_PADDING = 20;

const LoadingState = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      color: "white",
      background: "rgba(0.33, 0.33, 0.33, 0.33)"
    }}
  >
    <span>Loading presets</span>
  </div>
);

const ListWrapper = ({ width, height, children }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      padding: "15px 10px 0 10px"
    }}
  >
    <div
      style={{
        display: "inline-block",
        width: `${width - WIDTH_PADDING}px`,
        maxHeight: `${height - HEIGHT_PADDING}px`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        background: "rgba(0, 0, 0, 0.815)",
        fontSize: "12px"
      }}
    >
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {children}
      </ul>
    </div>
  </div>
);

class PresetOverlay extends React.Component {
  constructor(props) {
    super(props);
    const listIndex = this._listIndexFromPresetIndex(props.currentPreset);
    this.state = {
      selectedListIndex: clamp(listIndex, 0, this._maxListIndex())
    };
  }

  componentDidMount() {
    this._unsubscribeFocusedKeyDown = this.props.onFocusedKeyDown(
      this._handleFocusedKeyboardInput
    );
  }

  componentWillUnmount() {
    if (this._unsubscribeFocusedKeyDown) {
      this._unsubscribeFocusedKeyDown();
    }
  }

  _handleFocusedKeyboardInput = e => {
    switch (e.keyCode) {
      case 38: // up arrow
        this.setState({
          selectedListIndex: Math.max(this.state.selectedListIndex - 1, 0)
        });
        e.stopPropagation();
        break;
      case 40: // down arrow
        this.setState({
          selectedListIndex: Math.min(
            this.state.selectedListIndex + 1,
            this._maxListIndex()
          )
        });
        e.stopPropagation();
        break;
      case 13: // enter
        if (this.state.selectedListIndex === 0) {
          this.loadLocalDir();
        } else {
          this.props.selectPreset(
            this._presetIndexFromListIndex(this.state.selectedListIndex)
          );
        }
        e.stopPropagation();
        break;
      case 27: // escape
        this.props.closeOverlay();
        e.stopPropagation();
        break;
    }
  };

  _presetIndexFromListIndex(listIndex) {
    return listIndex - 1;
  }

  _listIndexFromPresetIndex(listIndex) {
    return listIndex + 1;
  }

  _maxListIndex() {
    // Number of presets, plus one for the "Load Local Directory" option, minus
    // one to convert a length to an index.
    return this.props.presetKeys.length; // - 1 + 1;
  }

  async loadLocalDir() {
    const fileReferences = await promptForFileReferences({ directory: true });
    // TODO: Technically there is a race condition here, since the component
    // could get unmounted before the promise resolves.
    this.props.loadPresets(fileReferences);
  }

  _renderList() {
    const { presetKeys, currentPreset, height, width } = this.props;
    const { selectedListIndex } = this.state;

    const maxVisibleRows = Math.floor((height - HEIGHT_PADDING) / ENTRY_HEIGHT);
    const rowsToShow = Math.floor(maxVisibleRows * 0.75); // Only fill 3/4 of the screen.
    const [startIndex, endIndex] = getRangeCenteredOnIndex(
      this._maxListIndex() + 1, // Add one to convert an index to a length
      rowsToShow,
      selectedListIndex
    );

    const presetElms = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const presetIndex = this._presetIndexFromListIndex(i);
      const isSelected = i === selectedListIndex;
      const isCurrent = presetIndex === currentPreset;
      let color;
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

    return (
      <ListWrapper width={width - 20} height={height}>
        {presetElms}
      </ListWrapper>
    );
  }

  render() {
    return this.props.presetKeys != null ? (
      this._renderList()
    ) : (
      <LoadingState />
    );
  }
}

// Find a tuple `[startIndex, endIndex]` representing start/end indexes into an
// array of length `length`, that descripe a range of size up to `rangeSize`
// where a best effort is made to center `indexToCenter`.
export function getRangeCenteredOnIndex(length, maxRangeSize, indexToCenter) {
  const rangeSize = Math.min(length, maxRangeSize);
  const halfRangeSize = Math.floor(rangeSize / 2);
  const idealStartIndex = indexToCenter - halfRangeSize;
  const startIndex = clamp(idealStartIndex, 0, length - rangeSize);
  const endIndex = startIndex + rangeSize - 1;
  return [startIndex, endIndex];
}

export default PresetOverlay;
