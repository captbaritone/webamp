import { CLOSE_WINAMP, STOP, TOGGLE_VISUALIZER_STYLE } from "../actionTypes";
import { Dispatchable } from "../types";

export {
  toggleDoubleSizeMode,
  toggleEqualizerShadeMode,
  togglePlaylistShadeMode,
  closeWindow,
  hideWindow,
  showWindow,
  setWindowSize,
  toggleWindow,
  updateWindowPositions,
  toggleMainWindowShadeMode
} from "./windows";
export {
  play,
  pause,
  stop,
  nextN,
  next,
  previous,
  seekForward,
  seekBackward,
  setVolume,
  adjustVolume,
  scrollVolume,
  setBalance,
  toggleRepeat,
  toggleShuffle
} from "./media";
export {
  setEqBand,
  setEqToMax,
  setEqToMid,
  setEqToMin,
  setPreamp,
  toggleEq
} from "./equalizer";
export {
  addTracksFromReferences,
  loadFilesFromReferences,
  setSkinFromArrayBuffer,
  setSkinFromFileReference,
  setSkinFromUrl,
  openEqfFileDialog,
  openMediaFileDialog,
  openSkinFileDialog,
  fetchMediaDuration,
  loadMediaFiles,
  loadMediaFile,
  fetchMediaTags,
  setEqFromFileReference,
  downloadPreset,
  downloadHtmlPlaylist
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
  dragSelected
} from "./playlist";

export function close(): Dispatchable {
  return dispatch => {
    dispatch({ type: STOP });
    dispatch({ type: CLOSE_WINAMP });
  };
}

export function toggleVisualizerStyle(): Dispatchable {
  return { type: TOGGLE_VISUALIZER_STYLE };
}
