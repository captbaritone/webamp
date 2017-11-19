import { parser, creator } from "winamp-eqf";
import MyFile from "./myFile";
import skinParser from "./skinParser";
import { BANDS } from "./constants";
import { getEqfData } from "./selectors";

import {
  clamp,
  base64FromArrayBuffer,
  downloadURI,
  normalize,
  sort
} from "./utils";
import {
  CLOSE_WINAMP,
  LOAD_AUDIO_URL,
  OPEN_FILE_DIALOG,
  SEEK_TO_PERCENT_COMPLETE,
  SET_BALANCE,
  SET_BAND_VALUE,
  SET_SKIN_DATA,
  SET_VOLUME,
  START_LOADING,
  STOP,
  TOGGLE_REPEAT,
  TOGGLE_SHUFFLE,
  SET_EQ_ON,
  SET_EQ_OFF,
  TOGGLE_EQUALIZER_SHADE_MODE,
  CLOSE_EQUALIZER_WINDOW,
  REMOVE_TRACKS,
  PLAY,
  PAUSE,
  REVERSE_LIST,
  RANDOMIZE_LIST,
  SET_TRACK_ORDER,
  TOGGLE_VISUALIZER_STYLE
} from "./actionTypes";

export function play() {
  return { type: PLAY };
}

export function pause() {
  return (dispatch, getState) => {
    const { status } = getState().media;
    dispatch({ type: status === "PLAYING" ? PAUSE : PLAY });
  };
}

export function stop() {
  return { type: STOP };
}

export function seekForward(seconds) {
  return function(dispatch, getState) {
    const { media } = getState();
    const { timeElapsed, length } = media;
    const newTimeElapsed = timeElapsed + seconds;
    const newPercentComplete = newTimeElapsed / length;
    dispatch({ type: SEEK_TO_PERCENT_COMPLETE, percent: newPercentComplete });
  };
}

export function seekBackward(seconds) {
  return seekForward(-seconds);
}

export function close() {
  return dispatch => {
    dispatch({ type: STOP });
    dispatch({ type: CLOSE_WINAMP });
  };
}

export function setVolume(volume) {
  return {
    type: SET_VOLUME,
    volume: clamp(volume, 0, 100)
  };
}

export function adjustVolume(volumeDiff) {
  return (dispatch, getState) => {
    const currentVolume = getState().media.volume;
    return dispatch(setVolume(currentVolume + volumeDiff));
  };
}

export function setBalance(balance) {
  balance = clamp(balance, -100, 100);
  // The balance clips to the center
  if (Math.abs(balance) < 25) {
    balance = 0;
  }
  return {
    type: SET_BALANCE,
    balance
  };
}

export function toggleRepeat() {
  return { type: TOGGLE_REPEAT };
}

export function toggleShuffle() {
  return { type: TOGGLE_SHUFFLE };
}

function setEqFromFile(file) {
  return dispatch => {
    file.processBuffer(arrayBuffer => {
      const eqf = parser(arrayBuffer);
      const preset = eqf.presets[0];

      dispatch(setPreamp(normalize(preset.preamp)));
      BANDS.forEach(band => {
        dispatch(setEqBand(band, normalize(preset[`hz${band}`])));
      });
    });
  };
}

const SKIN_FILENAME_MATCHER = new RegExp("(wsz|zip)$", "i");
const EQF_FILENAME_MATCHER = new RegExp("eqf$", "i");
export function loadFileFromReference(fileReference) {
  return dispatch => {
    const file = new MyFile();
    file.setFileReference(fileReference);
    if (SKIN_FILENAME_MATCHER.test(fileReference.name)) {
      dispatch(setSkinFromFile(file));
    } else if (EQF_FILENAME_MATCHER.test(fileReference.name)) {
      dispatch(setEqFromFile(file));
    } else {
      dispatch({
        type: LOAD_AUDIO_URL,
        url: URL.createObjectURL(fileReference),
        name: fileReference.name,
        autoPlay: true
      });
    }
  };
}

export function loadMediaFromUrl(url, name, autoPlay) {
  return dispatch => {
    dispatch({ type: LOAD_AUDIO_URL, url, name, autoPlay });
  };
}

export function setSkinFromFile(skinFile) {
  return async dispatch => {
    dispatch({ type: START_LOADING });
    const skinData = await skinParser(skinFile);
    dispatch({
      type: SET_SKIN_DATA,
      skinImages: skinData.images,
      skinColors: skinData.colors,
      skinPlaylistStyle: skinData.playlistStyle,
      skinCursors: skinData.cursors,
      skinRegion: skinData.region
    });
  };
}

export function setSkinFromUrl(url) {
  const skinFile = new MyFile();
  skinFile.setUrl(url);
  return setSkinFromFile(skinFile);
}

export function openFileDialog(fileInput) {
  fileInput.click();
  // No reducers currently respond to this.
  return { type: OPEN_FILE_DIALOG };
}

export function setEqBand(band, value) {
  return {
    type: SET_BAND_VALUE,
    band,
    value
  };
}

function _setEqTo(value) {
  return dispatch => {
    Object.keys(BANDS).forEach(key => {
      const band = BANDS[key];
      dispatch({
        type: SET_BAND_VALUE,
        value,
        band
      });
    });
  };
}

export function setEqToMax() {
  return _setEqTo(100);
}

export function setEqToMid() {
  return _setEqTo(50);
}

export function setEqToMin() {
  return _setEqTo(0);
}

export function setPreamp(value) {
  return {
    type: SET_BAND_VALUE,
    band: "preamp",
    value
  };
}

export function toggleEq() {
  return (dispatch, getState) => {
    const type = getState().equalizer.on ? SET_EQ_OFF : SET_EQ_ON;
    dispatch({ type });
  };
}

export function downloadPreset() {
  return (dispatch, getState) => {
    const state = getState();
    const data = getEqfData(state);
    const arrayBuffer = creator(data);
    const base64 = base64FromArrayBuffer(arrayBuffer);
    const dataURI = `data:application/zip;base64,${base64}`;
    downloadURI(dataURI, "entry.eqf");
  };
}

export function toggleEqualizerShadeMode() {
  return { type: TOGGLE_EQUALIZER_SHADE_MODE };
}

export function closeEqualizerWindow() {
  return { type: CLOSE_EQUALIZER_WINDOW };
}

export function cropPlaylist() {
  return (dispatch, getState) => {
    const { tracks } = getState();
    dispatch({
      type: REMOVE_TRACKS,
      ids: Object.keys(tracks).filter(id => !tracks[id].selected)
    });
  };
}

export function removeSelectedTracks() {
  return (dispatch, getState) => {
    const { tracks } = getState();
    dispatch({
      type: REMOVE_TRACKS,
      ids: Object.keys(tracks).filter(id => tracks[id].selected)
    });
  };
}

export function reverseList() {
  return { type: REVERSE_LIST };
}

export function randomizeList() {
  return { type: RANDOMIZE_LIST };
}

export function sortListByTitle() {
  return (dispatch, getState) => {
    const state = getState();
    const trackOrder = sort(state.playlist.trackOrder, i => {
      const { title, artist } = state.tracks[i];
      return `${artist} - ${title}`.toLowerCase();
    });
    return dispatch({ type: SET_TRACK_ORDER, trackOrder });
  };
}

export function toggleVisualizerStyle() {
  return { type: TOGGLE_VISUALIZER_STYLE };
}
