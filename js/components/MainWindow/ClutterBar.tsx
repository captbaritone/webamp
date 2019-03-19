import React from "react";
import { connect } from "react-redux";
import classnames from "classnames";

import { SET_FOCUS, UNSET_FOCUS } from "../../actionTypes";
import { toggleDoubleSizeMode } from "../../actionCreators";
import { AppState, Dispatch } from "../../types";
import OptionsContextMenu from "../OptionsContextMenu";
import ContextMenuTarget from "../ContextMenuTarget";

interface StateProps {
  doubled: boolean;
}

interface DispatchProps {
  handleMouseDown(): void;
  handleMouseUp(): void;
}

const ClutterBar = (props: StateProps & DispatchProps) => (
  <div id="clutter-bar">
    <ContextMenuTarget bottom handle={<div id="button-o" />}>
      <OptionsContextMenu />
    </ContextMenuTarget>
    <div id="button-a" />
    <div id="button-i" />
    <div
      title={"Toggle Doublesize Mode"}
      id="button-d"
      className={classnames({ selected: props.doubled })}
      onMouseUp={props.handleMouseUp}
      onMouseDown={props.handleMouseDown}
    />
    <div id="button-v" />
  </div>
);

const mapStateToProps = (state: AppState): StateProps => ({
  doubled: state.display.doubled,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  handleMouseDown: () => dispatch({ type: SET_FOCUS, input: "double" }),
  handleMouseUp: () => {
    dispatch(toggleDoubleSizeMode());
    dispatch({ type: UNSET_FOCUS });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClutterBar);
