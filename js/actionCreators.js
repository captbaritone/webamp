import MyFile from './myFile';
import skinParser from './skinParser';

import {clamp} from './utils';

export function play(mediaPlayer) {
  return (dispatch, getState) => {
    if (getState().media.status === 'PLAYING') {
      mediaPlayer.stop();
      dispatch({type: 'SET_MEDIA_STATUS', status: 'STOPPED'});
    } else {
      mediaPlayer.play();
      dispatch({type: 'SET_MEDIA_STATUS', status: 'PLAYING'});
    }
  };
}

export function pause(mediaPlayer) {
  return (dispatch, getState) => {
    const status = getState().media.status;
    switch (status) {
      case 'PAUSED':
        mediaPlayer.play();
        dispatch({type: 'SET_MEDIA_STATUS', status: 'PLAYING'});
        break;
      case 'PLAYING':
        mediaPlayer.pause();
        dispatch({type: 'SET_MEDIA_STATUS', status: 'PAUSED'});
        break;
    }
  };
}

export function stop(mediaPlayer) {
  return (dispatch) => {
    mediaPlayer.stop();
    dispatch({type: 'SET_MEDIA_STATUS', status: 'STOPPED'});
  };
}

export function close(mediaPlayer) {
  return (dispatch) => {
    mediaPlayer.stop();
    dispatch({type: 'CLOSE_WINAMP'});
  };
}

export function setVolume(mediaPlayer, volume) {
  const realVolume = clamp(volume, 0, 100);
  mediaPlayer.setVolume(realVolume);
  return {
    type: 'SET_VOLUME',
    volume: realVolume
  };
}

export function adjustVolume(mediaPlayer, volumeDiff) {
  return (dispatch, getState) => {
    const currentVolume = getState().media.volume;
    return dispatch(setVolume(mediaPlayer, currentVolume + volumeDiff));
  };
}

export function setBalance(mediaPlayer, balance) {
  balance = clamp(balance, -100, 100);
  // The balance clips to the center
  if (Math.abs(balance) < 25) {
    balance = 0;
  }
  mediaPlayer.setBalance(balance);
  return {
    type: 'SET_BALANCE',
    balance
  };
}


export function toggleRepeat(mediaPlayer) {
  mediaPlayer.toggleRepeat();
  return {type: 'TOGGLE_REPEAT'};
}

export function toggleShuffne(mediaPlayer) {
  mediaPlayer.toggleShuffne();
  return {type: 'TOGGLE_SHUFFLE'};
}

export function setSkinFromFile(skinFile) {
  return (dispatch) => {
    dispatch({type: 'START_LOADING'});
    skinParser(skinFile).then((skinData) => {
      return dispatch({
        type: 'SET_SKIN_DATA',
        skinCss: skinData.css,
        skinColors: skinData.colors,
        skinPlaylistStyle: skinData.playlistStyle
      });
    });
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
