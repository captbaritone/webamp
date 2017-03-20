import MyFile from "./myFile";
import skinParser from "./skinParser";
import { BANDS } from "./constants";

import { clamp } from "./utils";
import {
  CLOSE_WINAMP,
  LOAD_AUDIO_FILE,
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
  TOGGLE_SHUFFLE
} from "./actionTypes";

export function play() {
  return (dispatch, getState) => {
    const { status } = getState().media;
    dispatch({ type: status === "PLAYING" ? "STOP" : "PLAY" });
  };
}

export function pause() {
  return (dispatch, getState) => {
    const { status } = getState().media;
    dispatch({ type: status === "PLAYING" ? "PAUSE" : "PLAY" });
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

const SKIN_FILENAME_MATCHER = new RegExp("(wsz|zip)$", "i");
export function loadFileFromReference(fileReference) {
  return dispatch => {
    const file = new MyFile();
    file.setFileReference(fileReference);
    if (SKIN_FILENAME_MATCHER.test(fileReference.name)) {
      dispatch(setSkinFromFile(file));
    } else {
      dispatch({ type: LOAD_AUDIO_FILE, file });
    }
  };
}

export function loadMediaFromUrl(url, name) {
  return dispatch => {
    dispatch({ type: LOAD_AUDIO_URL, url, name });
  };
}

export function setSkinFromFile(skinFile) {
  return dispatch => {
    dispatch({ type: START_LOADING });
    skinParser(skinFile).then(skinData =>
      dispatch({
        type: SET_SKIN_DATA,
        skinImages: skinData.images,
        skinColors: skinData.colors,
        skinPlaylistStyle: skinData.playlistStyle
      }));
  };
}

export function setSkinFromUrl(url) {
  const skinFile = new MyFile();
  skinFile.setUrl(url);
  return setSkinFromFile(skinFile);
}

export function setSkinFromFilename(filename) {
  const url = `https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/${filename}`;
  return setSkinFromUrl(url);
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
