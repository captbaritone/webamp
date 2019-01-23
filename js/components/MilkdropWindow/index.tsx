// @ts-ignore #hook-types
import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import screenfull from "screenfull";
import ContextMenuWrapper from "../ContextMenuWrapper";
import GenWindow from "../GenWindow";
import { WINDOWS, VISUALIZERS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import MilkdropContextMenu from "./MilkdropContextMenu";
import Desktop from "./Desktop";
import { AppState, Dispatch } from "../../types";
import Visualizer from "./Visualizer";

import "../../../css/milkdrop-window.css";
import Background from "./Background";

interface StateProps {
  desktop: boolean;
}

interface DispatchProps {
  closeWindow(): void;
  toggleDesktop(): void;
}

interface OwnProps {
  analyser: AnalyserNode;
  height: number;
  width: number;
  onFocusedKeyDown(cb: (e: KeyboardEvent) => void): () => void;
}

type Props = StateProps & DispatchProps & OwnProps;

function Milkdrop(props: Props) {
  // Handle keyboard events
  useEffect(() => {
    return props.onFocusedKeyDown(e => {
      switch (e.keyCode) {
        case 32: // spacebar
          // this._nextPreset(USER_PRESET_TRANSITION_SECONDS);
          break;
        case 8: // backspace
          // this._prevPreset(0);
          break;
        case 72: // H
          // this._nextPreset(0);
          break;
        case 82: // R
          // this.props.presets.toggleRandomize();
          break;
        case 76: // L
          // this.setState({ presetOverlay: !this.state.presetOverlay });
          e.stopPropagation();
          break;
        case 84: // T
          // this.visualizer.launchSongTitleAnim(this.props.trackTitle);
          e.stopPropagation();
          break;
        case 145: // scroll lock
        case 125: // F14 (scroll lock for OS X)
          // this.presetCycle = !this.presetCycle;
          // this._restartCycling();
          break;
      }
    });
  }, [props.onFocusedKeyDown]);
  return (
    <GenWindow title={"Milkdrop"} windowId={WINDOWS.MILKDROP}>
      {({ height, width }) => (
        <Background>
          <Visualizer width={width} height={height} analyser={props.analyser} />
        </Background>
      )}
    </GenWindow>
  );
}

const mapStateToProps = (state: AppState): StateProps => ({
  desktop: Selectors.getMilkdropDesktopEnabled(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  closeWindow: () => dispatch(Actions.closeWindow(WINDOWS.MILKDROP)),
  toggleDesktop: () => dispatch(Actions.toggleMilkdropDesktop())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Milkdrop);
