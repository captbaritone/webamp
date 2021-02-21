import {
  CLOSE_WINAMP,
  OPEN_WINAMP,
  STOP,
  TOGGLE_VISUALIZER_STYLE,
  CLOSE_REQUESTED,
  MINIMIZE_WINAMP,
  SET_FOCUS,
  UNSET_FOCUS,
  LOAD_SERIALIZED_STATE,
  LOAD_DEFAULT_SKIN,
  SET_MILKDROP_DESKTOP,
  SET_MILKDROP_FULLSCREEN,
  TOGGLE_PRESET_OVERLAY,
  STEP_MARQUEE,
  SET_BAND_FOCUS,
} from "../actionTypes";
import { WINDOWS } from "../constants";
import { Thunk, Action, Slider } from "../types";
import { SerializedStateV1 } from "../serializedStates/v1Types";
import * as Selectors from "../selectors";
import { ensureWindowsAreOnScreen, setFocusedWindow } from "./windows";

export {
  toggleDoubleSizeMode,
  toggleEqualizerShadeMode,
  togglePlaylistShadeMode,
  closeWindow,
  setWindowSize,
  toggleWindow,
  updateWindowPositions,
  toggleMainWindowShadeMode,
  centerWindowsInContainer,
  centerWindowsInView,
  resetWindowSizes,
  browserWindowSizeChanged,
  ensureWindowsAreOnScreen,
  stackWindows,
  toggleLlamaMode,
  setFocusedWindow,
} from "./windows";
export {
  play,
  pause,
  stop,
  nextN,
  next,
  previous,
  seekToTime,
  seekForward,
  seekBackward,
  setVolume,
  playTrack,
  playTrackNow,
  adjustVolume,
  scrollVolume,
  setBalance,
  toggleRepeat,
  toggleShuffle,
  toggleTimeMode,
} from "./media";
export {
  setEqBand,
  setEqToMax,
  setEqToMid,
  setEqToMin,
  setPreamp,
  toggleEq,
  toggleEqAuto,
} from "./equalizer";
export {
  addTracksFromReferences,
  loadFilesFromReferences,
  setSkinFromUrl,
  openEqfFileDialog,
  openMediaFileDialog,
  openSkinFileDialog,
  fetchMediaDuration,
  loadMedia,
  loadMediaFiles,
  loadMediaFile,
  fetchMediaTags,
  setEqFromFileReference,
  downloadPreset,
  setEqFromObject,
  downloadHtmlPlaylist,
  addDirAtIndex,
  addFilesAtIndex,
  addFilesFromUrl,
  addFilesFromList,
  saveFilesToList,
  droppedFiles,
} from "./files";
export {
  cropPlaylist,
  removeSelectedTracks,
  removeAllTracks,
  reverseList,
  randomizeList,
  sortListByTitle,
  setPlaylistScrollPosition,
  scrollNTracks,
  scrollPlaylistByDelta,
  scrollUpFourTracks,
  scrollDownFourTracks,
  dragSelected,
  selectAll,
  selectZero,
  invertSelection,
} from "./playlist";
export {
  initializePresets,
  requestPresetAtIndex,
  selectRandomPreset,
  selectNextPreset,
  selectPreviousPreset,
  appendPresetFileList,
  handlePresetDrop,
  loadPresets,
  toggleRandomizePresets,
  togglePresetCycling,
  scheduleMilkdropMessage,
} from "./milkdrop";

export function close(): Thunk {
  return (dispatch) => {
    // TODO: This could probably be improved by adding a "PREVENT_CLOSE" action
    // or something, but this works okay for now.
    let defaultPrevented = false;
    const cancel = () => {
      defaultPrevented = true;
    };
    dispatch({ type: CLOSE_REQUESTED, cancel });
    if (!defaultPrevented) {
      dispatch({ type: STOP });
      dispatch({ type: CLOSE_WINAMP });
    }
  };
}

export function open(): Action {
  return { type: OPEN_WINAMP };
}

export function toggleVisualizerStyle(): Action {
  return { type: TOGGLE_VISUALIZER_STYLE };
}

export function minimize(): Action {
  return { type: MINIMIZE_WINAMP };
}

export function setFocus(input: string): Action {
  return { type: SET_FOCUS, input };
}

export function unsetFocus(): Action {
  return { type: UNSET_FOCUS };
}

export function focusBand(band: Slider): Action {
  return { type: SET_BAND_FOCUS, input: "eq", bandFocused: band };
}

export function loadSerializedState(
  // In the future this type should be the union of all versioned types.
  serializedState: SerializedStateV1
): Thunk {
  return (dispatch) => {
    dispatch({ type: LOAD_SERIALIZED_STATE, serializedState });
    dispatch(ensureWindowsAreOnScreen());
  };
}

export function loadDefaultSkin(): Action {
  return { type: LOAD_DEFAULT_SKIN };
}

export function toggleMilkdropDesktop(): Thunk {
  return (dispatch, getState) => {
    if (Selectors.getMilkdropDesktopEnabled(getState())) {
      dispatch({ type: SET_MILKDROP_DESKTOP, enabled: false });
    } else {
      dispatch({ type: SET_MILKDROP_DESKTOP, enabled: true });
    }
  };
}

export function setMilkdropFullscreen(enabled: boolean): Action {
  return { type: SET_MILKDROP_FULLSCREEN, enabled };
}
export function toggleMilkdropFullscreen(): Thunk {
  return (dispatch, getState) => {
    dispatch(
      setMilkdropFullscreen(!Selectors.getMilkdropFullscreenEnabled(getState()))
    );
  };
}

export function togglePresetOverlay(): Thunk {
  return (dispatch, getState) => {
    if (Selectors.getPresetOverlayOpen(getState())) {
      dispatch(setFocusedWindow(WINDOWS.MILKDROP));
    }

    dispatch({ type: TOGGLE_PRESET_OVERLAY });
  };
}

export function stepMarquee(): Action {
  return { type: STEP_MARQUEE };
}
