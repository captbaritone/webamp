import React, { useEffect, useCallback } from "react";
import Fullscreen from "../Fullscreen";
import { connect } from "react-redux";
import { useWindowSize, useScreenSize } from "../../hooks";
import GenWindow from "../GenWindow";
import { WINDOWS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { AppState, Dispatch, TransitionType } from "../../types";
import Visualizer from "./Visualizer";

import "../../../css/milkdrop-window.css";
import Background from "./Background";
import PresetOverlay from "./PresetOverlay";
import DropTarget from "../DropTarget";
import MilkdropContextMenu from "./MilkdropContextMenu";
import Desktop from "./Desktop";

const MILLISECONDS_BETWEEN_PRESET_TRANSITIONS = 15000;

interface StateProps {
  desktop: boolean;
  fullscreen: boolean;
  overlay: boolean;
  presetsAreCycling: boolean;
  currentPresetIndex: number | null; // Index
  trackTitle: string | null;
}

interface DispatchProps {
  closeWindow(): void;
  toggleDesktop(): void;
  toggleFullscreen(): void;
  setFullscreen(fullscreen: boolean): void;
  togglePresetOverlay(): void;
  selectRandomPreset(): void;
  toggleRandomize(): void;
  toggleCycling(): void;
  handlePresetDrop(e: React.DragEvent): void;
  selectNextPreset(transitionType?: TransitionType): void;
  selectPreviousPreset(transitionType?: TransitionType): void;
  scheduleMilkdropMessage(message: string): void;
}

interface OwnProps {
  analyser: AnalyserNode;
}

type Props = StateProps & DispatchProps & OwnProps;

function useKeyHandler(props: Props) {
  const {
    selectNextPreset,
    selectPreviousPreset,
    toggleRandomize,
    togglePresetOverlay,
    scheduleMilkdropMessage,
    trackTitle,
    toggleCycling,
  } = props;
  // Handle keyboard events
  return useCallback(
    (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 32: // spacebar
          selectNextPreset();
          break;
        case 8: // backspace
          selectPreviousPreset(TransitionType.IMMEDIATE);
          break;
        case 72: // H
          selectNextPreset(TransitionType.IMMEDIATE);
          break;
        case 82: // R
          toggleRandomize();
          break;
        case 76: // L
          togglePresetOverlay();
          e.stopPropagation();
          break;
        case 84: // T
          if (trackTitle != null) {
            scheduleMilkdropMessage(trackTitle);
          }
          e.stopPropagation();
          break;
        case 145: // scroll lock
        case 125: // F14 (scroll lock for OS X)
          toggleCycling();
          break;
      }
    },
    [
      selectNextPreset,
      selectPreviousPreset,
      toggleRandomize,
      togglePresetOverlay,
      scheduleMilkdropMessage,
      trackTitle,
      toggleCycling,
    ]
  );
}

function Milkdrop(props: Props) {
  const handleKeyDown = useKeyHandler(props);

  // Cycle presets
  useEffect(() => {
    if (!props.presetsAreCycling) {
      return;
    }
    const intervalId = setInterval(
      props.selectNextPreset,
      MILLISECONDS_BETWEEN_PRESET_TRANSITIONS
    );
    return () => clearInterval(intervalId);
  }, [
    props.selectNextPreset,
    props.presetsAreCycling,
    props.currentPresetIndex,
  ]);

  const screenSize = useScreenSize();
  const windowSize = useWindowSize();

  if (props.desktop) {
    return (
      <Desktop>
        <MilkdropContextMenu>
          <Visualizer {...windowSize} analyser={props.analyser} />
        </MilkdropContextMenu>
      </Desktop>
    );
  }

  return (
    <GenWindow
      title={"Milkdrop"}
      windowId={WINDOWS.MILKDROP}
      onKeyDown={handleKeyDown}
    >
      {(windowSize: { width: number; height: number }) => {
        const size = props.fullscreen ? screenSize : windowSize;
        return (
          <MilkdropContextMenu>
            <Background>
              <DropTarget handleDrop={props.handlePresetDrop}>
                {props.overlay && <PresetOverlay {...size} />}
                <Fullscreen
                  enabled={props.fullscreen}
                  onChange={props.setFullscreen}
                >
                  <div onDoubleClick={props.toggleFullscreen}>
                    <Visualizer {...size} analyser={props.analyser} />
                  </div>
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
  fullscreen: Selectors.getMilkdropFullscreenEnabled(state),
  overlay: Selectors.getPresetOverlayOpen(state),
  presetsAreCycling: Selectors.getPresetsAreCycling(state),
  currentPresetIndex: Selectors.getCurrentPresetIndex(state),
  trackTitle: Selectors.getCurrentTrackDisplayName(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  closeWindow: () => dispatch(Actions.closeWindow(WINDOWS.MILKDROP)),
  toggleDesktop: () => dispatch(Actions.toggleMilkdropDesktop()),
  toggleFullscreen: () => dispatch(Actions.toggleMilkdropFullscreen()),
  setFullscreen: (fullscreen: boolean) =>
    dispatch(Actions.setMilkdropFullscreen(fullscreen)),
  togglePresetOverlay: () => dispatch(Actions.togglePresetOverlay()),
  selectRandomPreset: () => dispatch(Actions.selectRandomPreset()),
  toggleRandomize: () => dispatch(Actions.toggleRandomizePresets()),
  toggleCycling: () => dispatch(Actions.togglePresetCycling()),
  handlePresetDrop: e => dispatch(Actions.handlePresetDrop(e)),
  selectNextPreset: (transitionType?: TransitionType) =>
    dispatch(Actions.selectNextPreset(transitionType)),
  selectPreviousPreset: (transitionType?: TransitionType) =>
    dispatch(Actions.selectPreviousPreset(transitionType)),
  scheduleMilkdropMessage: (message: string) =>
    dispatch(Actions.scheduleMilkdropMessage(message)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Milkdrop);
