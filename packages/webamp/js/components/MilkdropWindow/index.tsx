import { useEffect, useCallback } from "react";
import Fullscreen from "../Fullscreen";
import {
  useWindowSize,
  useScreenSize,
  useTypedSelector,
  useActionCreator,
} from "../../hooks";
import GenWindow from "../GenWindow";
import { WINDOWS } from "../../constants";
import * as Selectors from "../../selectors";
import * as Actions from "../../actionCreators";
import { TransitionType } from "../../types";
import Visualizer from "./Visualizer";

import "../../../css/milkdrop-window.css";
import Background from "./Background";
import PresetOverlay from "./PresetOverlay";
import DropTarget from "../DropTarget";
import MilkdropContextMenu from "./MilkdropContextMenu";
import Desktop from "./Desktop";

const MILLISECONDS_BETWEEN_PRESET_TRANSITIONS = 15000;

interface Props {
  analyser: AnalyserNode;
}

function useKeyHandler() {
  const trackTitle = useTypedSelector(Selectors.getCurrentTrackDisplayName);

  const selectNextPreset = useActionCreator(Actions.selectNextPreset);
  const selectPreviousPreset = useActionCreator(Actions.selectPreviousPreset);
  const toggleRandomize = useActionCreator(Actions.toggleRandomizePresets);
  const togglePresetOverlay = useActionCreator(Actions.togglePresetOverlay);
  const scheduleMilkdropMessage = useActionCreator(
    Actions.scheduleMilkdropMessage
  );
  const toggleCycling = useActionCreator(Actions.togglePresetCycling);

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
      scheduleMilkdropMessage,
      selectNextPreset,
      selectPreviousPreset,
      toggleCycling,
      togglePresetOverlay,
      toggleRandomize,
      trackTitle,
    ]
  );
}

function Milkdrop({ analyser }: Props) {
  const desktop = useTypedSelector(Selectors.getMilkdropDesktopEnabled);
  const fullscreen = useTypedSelector(Selectors.getMilkdropFullscreenEnabled);
  const overlay = useTypedSelector(Selectors.getPresetOverlayOpen);
  const presetsAreCycling = useTypedSelector(Selectors.getPresetsAreCycling);
  const currentPresetIndex = useTypedSelector(Selectors.getCurrentPresetIndex);
  const mediaIsPlaying = useTypedSelector(Selectors.getMediaIsPlaying);

  const toggleFullscreen = useActionCreator(Actions.toggleMilkdropFullscreen);
  const selectNextPreset = useActionCreator(Actions.selectNextPreset);
  const handlePresetDrop = useActionCreator(Actions.handlePresetDrop);
  const setFullscreen = useActionCreator(Actions.setMilkdropFullscreen);

  const handleKeyDown = useKeyHandler();

  // Cycle presets
  useEffect(() => {
    if (!presetsAreCycling || !mediaIsPlaying) {
      return;
    }
    const intervalId = setInterval(
      selectNextPreset,
      MILLISECONDS_BETWEEN_PRESET_TRANSITIONS
    );
    return () => clearInterval(intervalId);
  }, [presetsAreCycling, currentPresetIndex, mediaIsPlaying, selectNextPreset]);

  const screenSize = useScreenSize();
  const windowSize = useWindowSize();

  if (desktop) {
    return (
      <Desktop>
        <MilkdropContextMenu>
          <Visualizer {...windowSize} analyser={analyser} />
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
      {(genWindowSize: { width: number; height: number }) => {
        const size = fullscreen ? screenSize : genWindowSize;
        return (
          <MilkdropContextMenu>
            <Background>
              <DropTarget
                windowId={WINDOWS.MILKDROP}
                handleDrop={handlePresetDrop}
              >
                {overlay && <PresetOverlay {...size} />}
                <Fullscreen enabled={fullscreen} onChange={setFullscreen}>
                  <div onDoubleClick={toggleFullscreen}>
                    <Visualizer {...size} analyser={analyser} />
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
export default Milkdrop;
