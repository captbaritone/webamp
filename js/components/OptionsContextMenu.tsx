import React from "react";
import { connect } from "react-redux";

import { Hr, Node } from "./ContextMenu";
import SkinsContextMenu from "./SkinsContextMenu";
import { Dispatch, TimeMode, AppState } from "../types";
import * as Actions from "../actionCreators";
import { TIME_MODE } from "../constants";

interface StateProps {
  timeMode: TimeMode;
  doubled: boolean;
  repeat: boolean;
  shuffle: boolean;
}

interface DispatchProps {
  toggleTimeMode(): void;
  toggleDoubleSizeMode(): void;
  toggleRepeat(): void;
  toggleShuffle(): void;
}

const OptionsContextMenu = (props: DispatchProps & StateProps) => (
  <React.Fragment>
    {/* <Node label="Preferences..." /> */}
    <SkinsContextMenu />
    <Hr />
    <Node
      label="Time elapsed"
      hotkey="(Ctrl+T toggles)"
      onClick={props.toggleTimeMode}
      checked={props.timeMode === TIME_MODE.ELAPSED}
    />
    <Node
      label="Time remaining"
      hotkey="(Ctrl+T toggles)"
      onClick={props.toggleTimeMode}
      checked={props.timeMode === TIME_MODE.REMAINING}
    />
    {/* <Node label="Always On Top" hotkey="Ctrl+A" /> */}
    <Node
      label="Double Size"
      hotkey="Ctrl+D"
      onClick={props.toggleDoubleSizeMode}
      checked={props.doubled}
    />
    {/* <Node label="EasyMove" hotkey="Ctrl+E" /> */}
    <Hr />
    <Node
      label="Repeat"
      hotkey="R"
      onClick={props.toggleRepeat}
      checked={props.repeat}
    />
    <Node
      label="Shuffle"
      hotkey="S"
      onClick={props.toggleShuffle}
      checked={props.shuffle}
    />
  </React.Fragment>
);

const mapStateToProps = (state: AppState): StateProps => {
  return {
    doubled: state.display.doubled,
    timeMode: state.media.timeMode,
    repeat: state.media.repeat,
    shuffle: state.media.shuffle,
  };
};
const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return {
    toggleTimeMode: () => dispatch(Actions.toggleTimeMode()),
    toggleDoubleSizeMode: () => dispatch(Actions.toggleDoubleSizeMode()),
    toggleRepeat: () => dispatch(Actions.toggleRepeat()),
    toggleShuffle: () => dispatch(Actions.toggleShuffle()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OptionsContextMenu);
