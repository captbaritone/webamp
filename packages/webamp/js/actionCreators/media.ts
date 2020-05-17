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
  PLAY_TRACK,
  TOGGLE_TIME_MODE,
  BUFFER_TRACK,
  IS_STOPPED,
} from "../actionTypes";

import { MEDIA_STATUS } from "../constants";
import { openMediaFileDialog } from "./";
import { GetState, Dispatch, Thunk, Action } from "../types";
import * as Selectors from "../selectors";

export function playTrack(id: number): Thunk {
  return (dispatch, getState) => {
    const state = getState();
    const isStopped = Selectors.getMediaStatus(state) === MEDIA_STATUS.STOPPED;
    if (isStopped) {
      dispatch({ type: BUFFER_TRACK, id });
    } else {
      dispatch({ type: PLAY_TRACK, id });
    }
  };
}

export function playTrackNow(id: number): Action {
  return { type: PLAY_TRACK, id };
}

export function play(): Thunk {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    if (
      state.media.status === MEDIA_STATUS.STOPPED &&
      state.playlist.currentTrack == null &&
      state.playlist.trackOrder.length === 0
    ) {
      dispatch(openMediaFileDialog());
    } else {
      dispatch({ type: PLAY });
    }
  };
}

export function pause(): Thunk {
  return (dispatch, getState) => {
    const { status } = getState().media;
    if (status === MEDIA_STATUS.PLAYING) {
      dispatch({ type: PAUSE });
    } else {
      dispatch({ type: PLAY });
    }
  };
}

export function stop(): Action {
  return { type: STOP };
}

export function nextN(n: number): Thunk {
  return (dispatch, getState) => {
    const nextTrackId = Selectors.getNextTrackId(getState(), n);
    if (nextTrackId == null) {
      dispatch({ type: IS_STOPPED });
      return;
    }
    dispatch(playTrack(nextTrackId));
  };
}

export function next(): Thunk {
  return nextN(1);
}

export function previous(): Thunk {
  return nextN(-1);
}

export function seekToTime(seconds: number): Thunk {
  return function (dispatch, getState) {
    const state = getState();
    const duration = Selectors.getDuration(state);
    if (duration == null) {
      return;
    }
    dispatch({
      type: SEEK_TO_PERCENT_COMPLETE,
      percent: (seconds / duration) * 100,
    });
  };
}
export function seekForward(seconds: number): Thunk {
  return function (dispatch, getState) {
    const timeElapsed = Selectors.getTimeElapsed(getState());
    dispatch(seekToTime(timeElapsed + seconds));
  };
}

export function seekBackward(seconds: number): Thunk {
  return seekForward(-seconds);
}

export function setVolume(volume: number): Action {
  return {
    type: SET_VOLUME,
    volume: clamp(volume, 0, 100),
  };
}

export function adjustVolume(volumeDiff: number): Thunk {
  return (dispatch, getState) => {
    const currentVolume = getState().media.volume;
    return dispatch(setVolume(currentVolume + volumeDiff));
  };
}

export function scrollVolume(e: React.WheelEvent<HTMLDivElement>): Thunk {
  e.preventDefault();
  return (dispatch, getState) => {
    const currentVolume = getState().media.volume;
    // Using pixels as percentage difference here is a bit arbirary, but... oh well.
    return dispatch(setVolume(currentVolume + e.deltaY));
  };
}

export function setBalance(balance: number): Action {
  balance = clamp(balance, -100, 100);
  // The balance clips to the center
  if (Math.abs(balance) < 25) {
    balance = 0;
  }
  return {
    type: SET_BALANCE,
    balance,
  };
}

export function toggleRepeat(): Action {
  return { type: TOGGLE_REPEAT };
}

export function toggleShuffle(): Action {
  return { type: TOGGLE_SHUFFLE };
}

export function toggleTimeMode(): Action {
  return { type: TOGGLE_TIME_MODE };
}
