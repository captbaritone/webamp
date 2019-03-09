import React, { useEffect, useState, useCallback } from "react";
import Fullscreen from "react-full-screen";
import { connect } from "react-redux";
import GenWindow from "../GenWindow";
import { WINDOWS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { AppState, Dispatch } from "../../types";
import Visualizer from "./Visualizer";

import "../../../css/milkdrop-window.css";
import Background from "./Background";
import PresetOverlay from "./PresetOverlay";
import DropTarget from "../DropTarget";
import MilkdropContextMenu from "./MilkdropContextMenu";

const MILLISECONDS_BETWEEN_PRESET_TRANSITIONS = 15000;

interface StateProps {
  desktop: boolean;
  overlay: boolean;
}

interface DispatchProps {
  closeWindow(): void;
  toggleDesktop(): void;
  togglePresetOverlay(): void;
  selectRandomPreset(): void;
  handlePresetDrop(e: React.DragEvent): void;
}

interface OwnProps {
  analyser: AnalyserNode;
  onFocusedKeyDown(
    cb: (e: React.KeyboardEvent<HTMLDivElement>) => void
  ): () => void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface Size {
  width: number;
  height: number;
}

function getScreenSize(): Size {
  return {
    width: window.screen.width,
    height: window.screen.height
  };
}
function useScreenSize() {
  const [size, setSize] = useState<Size>(getScreenSize());
  // TODO: We could subscribe to screen size changes.
  return size;
}

function Milkdrop(props: Props) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
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
          props.togglePresetOverlay();
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

  // Cycle presets
  useEffect(() => {
    const intervalId = setInterval(
      props.selectRandomPreset,
      MILLISECONDS_BETWEEN_PRESET_TRANSITIONS
    );
    return () => clearImmediate(intervalId);
  }, [props.selectRandomPreset]);

  const toggleFullscreen = useCallback(() => setIsFullscreen(!isFullscreen), [
    setIsFullscreen
  ]);

  const screenSize = useScreenSize();

  return (
    <GenWindow title={"Milkdrop"} windowId={WINDOWS.MILKDROP}>
      {(windowSize: { width: number; height: number }) => {
        const size = isFullscreen ? screenSize : windowSize;
        return (
          <MilkdropContextMenu toggleFullscreen={toggleFullscreen}>
            <Background>
              <DropTarget handleDrop={props.handlePresetDrop}>
                {props.overlay && (
                  <PresetOverlay
                    {...size}
                    onFocusedKeyDown={props.onFocusedKeyDown}
                  />
                )}
                <Fullscreen enabled={isFullscreen} onChange={setIsFullscreen}>
                  {/* TODO: Figure out how to let double clicking exit fullscreen */}
                  <Visualizer {...size} analyser={props.analyser} />
                </Fullscreen>
              </DropTarget>
            </Background>
          </MilkdropContextMenu>
        );
      }}
    </GenWindow>
  );
}

const mapStateToProps = (state: AppState): StateProps => ({
  desktop: Selectors.getMilkdropDesktopEnabled(state),
  overlay: Selectors.getPresetOverlayOpen(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  closeWindow: () => dispatch(Actions.closeWindow(WINDOWS.MILKDROP)),
  toggleDesktop: () => dispatch(Actions.toggleMilkdropDesktop()),
  togglePresetOverlay: () => dispatch(Actions.togglePresetOverlay()),
  selectRandomPreset: () => dispatch(Actions.selectRandomPreset()),
  handlePresetDrop: e => dispatch(Actions.handlePresetDrop(e))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Milkdrop);
