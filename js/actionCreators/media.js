import { nextTrack } from "../selectors";

import { clamp } from "../utils";
import {
  SEEK_TO_PERCENT_COMPLETE,
  SET_BALANCE,
  SET_VOLUME,
  STOP,
  TOGGLE_REPEAT,
  TOGGLE_SHUFFLE,
  PLAY,
  PAUSE,
  PLAY_TRACK
} from "../actionTypes";

import { openMediaFileDialog } from "./";

function playRandomTrack() {
  return (dispatch, getState) => {
    const {
      playlist: { trackOrder, currentTrack }
    } = getState();
    if (trackOrder.length === 0) {
      return;
    }
    let nextId;
    do {
      nextId = trackOrder[Math.floor(trackOrder.length * Math.random())];
    } while (nextId === currentTrack && trackOrder.length > 1);
    // TODO: Sigh... Technically, we should detect if we are looping only repeat if we are.
    // I think this would require pre-computing the "random" order of a playlist.
    dispatch({ type: PLAY_TRACK, id: nextId });
  };
}

export function play() {
  return (dispatch, getState) => {
    const state = getState();
    if (
      state.media.status === "STOPPED" &&
      state.playlist.curentTrack == null &&
      state.playlist.trackOrder.length === 0
    ) {
      dispatch(openMediaFileDialog());
    } else {
      dispatch({ type: PLAY });
    }
  };
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

export function nextN(n) {
  return (dispatch, getState) => {
    const state = getState();
    if (state.media.shuffle) {
      dispatch(playRandomTrack());
      return;
    }
    const nextTrackId = nextTrack(state, n);
    if (nextTrackId == null) {
      return;
    }
    dispatch({ type: PLAY_TRACK, id: nextTrackId });
  };
}

export function next() {
  return nextN(1);
}

export function previous() {
  return nextN(-1);
}

export function seekForward(seconds) {
  return function(dispatch, getState) {
    const { timeElapsed, length } = getState().media;
    const newTimeElapsed = timeElapsed + seconds;
    dispatch({
      type: SEEK_TO_PERCENT_COMPLETE,
      percent: newTimeElapsed / length * 100
    });
  };
}

export function seekBackward(seconds) {
  return seekForward(-seconds);
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

export function scrollVolume(e) {
  e.preventDefault();
  return (dispatch, getState) => {
    const currentVolume = getState().media.volume;
    // Using pixels as percentage difference here is a bit arbirary, but... oh well.
    return dispatch(setVolume(currentVolume + e.deltaY));
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
