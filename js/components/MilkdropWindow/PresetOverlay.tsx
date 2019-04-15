import React from "react";
import { promptForFileReferences } from "../../fileUtils";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { clamp } from "../../utils";
import { AppState, Dispatch, TransitionType } from "../../types";
import { connect } from "react-redux";
import Disposable from "../../Disposable";

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

interface State {
  selectedListIndex: number;
}

interface StateProps {
  presetKeys: string[];
  currentPresetIndex: number | null; // Index
}

interface DispatchProps {
  requestPresetAtIndex(i: number): void;
  togglePresetOverlay(): void;
  appendPresetFileList(fileList: FileList): void;
}

interface OwnProps {
  height: number;
  width: number;
}

type Props = StateProps & DispatchProps & OwnProps;

class PresetOverlay extends React.Component<Props, State> {
  _disposable: Disposable;

  constructor(props: Props) {
    super(props);
    this.state = { selectedListIndex: 0 };
    this._disposable = new Disposable();
  }

  componentDidMount() {
    const { currentPresetIndex } = this.props;
    if (currentPresetIndex != null) {
      this.setState({
        selectedListIndex: this._listIndexFromPresetIndex(currentPresetIndex),
      });
    }
  }

  componentWillUnmount() {
    this._disposable.dispose();
  }

  _presetIndexFromListIndex(listIndex: number) {
    return listIndex - 1;
  }

  _listIndexFromPresetIndex(listIndex: number) {
    return listIndex + 1;
  }

  _maxListIndex() {
    // Number of presets, plus one for the "Load Local Directory" option, minus
    // one to convert a length to an index.
    return this.props.presetKeys.length; // - 1 + 1;
  }

  _renderList() {
    const { presetKeys, currentPresetIndex, height } = this.props;
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
  }

  _handleFocusedKeyboardInput = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.keyCode) {
      case 38: // up arrow
        this.setState({
          selectedListIndex: Math.max(this.state.selectedListIndex - 1, 0),
        });
        e.stopPropagation();
        break;
      case 40: // down arrow
        this.setState({
          selectedListIndex: Math.min(
            this.state.selectedListIndex + 1,
            this._maxListIndex()
          ),
        });
        e.stopPropagation();
        break;
      case 13: // enter
        if (this.state.selectedListIndex === 0) {
          this.loadLocalDir();
        } else {
          this.props.requestPresetAtIndex(
            this._presetIndexFromListIndex(this.state.selectedListIndex)
          );
        }
        e.stopPropagation();
        break;
      case 27: // escape
        this.props.togglePresetOverlay();
        e.stopPropagation();
        break;
    }
  };

  async loadLocalDir() {
    const fileReferences = await promptForFileReferences({ directory: true });
    if (this._disposable.disposed) {
      return;
    }
    // TODO: Technically there is a race condition here, since the component
    // could get unmounted before the promise resolves.
    this.props.appendPresetFileList(fileReferences);
  }

  render() {
    const { height, width } = this.props;
    if (this.props.presetKeys == null) {
      return (
        <div style={LOADING_STYLE}>
          <span>Loading presets</span>
        </div>
      );
    }
    return (
      <div
        style={OUTER_WRAPPER_STYLE}
        onKeyDown={this._handleFocusedKeyboardInput}
      >
        <div
          style={{
            ...INNER_WRAPPER_STYLE,
            width: width - 20 - WIDTH_PADDING,
            maxHeight: height - HEIGHT_PADDING,
          }}
        >
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {this._renderList()}
          </ul>
        </div>
      </div>
    );
  }
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

function mapStateToProps(state: AppState): StateProps {
  return {
    presetKeys: Selectors.getPresetNames(state),
    currentPresetIndex: Selectors.getCurrentPresetIndex(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    requestPresetAtIndex: (i: number) => {
      dispatch(Actions.requestPresetAtIndex(i, TransitionType.DEFAULT, true));
    },
    togglePresetOverlay: () => dispatch(Actions.togglePresetOverlay()),
    appendPresetFileList: (fileList: FileList) =>
      dispatch(Actions.appendPresetFileList(fileList)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PresetOverlay);
