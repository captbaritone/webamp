import MyFile from './myFile';
import skinParser from './skinParser';
import {BANDS} from './constants';

import {clamp} from './utils';
import {
  CLOSE_WINAMP,
  SET_BALANCE,
  SET_BAND_VALUE,
  SET_SKIN_DATA,
  SET_VOLUME,
  START_LOADING,
  TOGGLE_REPEAT,
  TOGGLE_SHUFFLE
} from './actionTypes';

export function play() {
  return (dispatch, getState) => {
    const {status} = getState().media;
    dispatch({type: (status === 'PLAYING') ? 'STOP' : 'PLAY'});
  };
}

export function pause() {
  return (dispatch, getState) => {
    const {status} = getState().media;
    dispatch({type: (status === 'PLAYING') ? 'PAUSE' : 'PLAY'});
  };
}

export function stop() {
  return {type: 'STOP'};
}

export function close() {
  return (dispatch) => {
    dispatch({type: 'STOP'});
    dispatch({type: CLOSE_WINAMP});
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


export function toggleRepeat(mediaPlayer) {
  mediaPlayer.toggleRepeat();
  return {type: TOGGLE_REPEAT};
}

export function toggleShuffle(mediaPlayer) {
  mediaPlayer.toggleShuffle();
  return {type: TOGGLE_SHUFFLE};
}

export function setSkinFromFile(skinFile) {
  return (dispatch) => {
    dispatch({type: START_LOADING});
    skinParser(skinFile).then((skinData) => dispatch({
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

export function openFileDialog(winamp) {
  winamp.openFileDialog();
}

export function setEqBand(mediaPlayer, band, value) {
  mediaPlayer.setEqBand(band, value);
  return (dispatch) => dispatch({
    type: SET_BAND_VALUE,
    band,
    value
  });
}

function _setEqTo(mediaPlayer, value) {
  return (dispatch) => {
    Object.keys(BANDS).forEach((key) => {
      const band = BANDS[key];
      mediaPlayer.setEqBand(band, value);
      dispatch({
        type: SET_BAND_VALUE,
        value,
        band
      });
    });
  };
}

export function setEqToMax(mediaPlayer) {
  return _setEqTo(mediaPlayer, 100);
}

export function setEqToMid(mediaPlayer) {
  return _setEqTo(mediaPlayer, 50);
}

export function setEqToMin(mediaPlayer) {
  return _setEqTo(mediaPlayer, 0);
}

export function setPreamp(mediaPlayer, value) {
  mediaPlayer.setPreamp(value);
  return (dispatch) => dispatch({
    type: SET_BAND_VALUE,
    band: 'preamp',
    value
  });
}
