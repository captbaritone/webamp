import { Action, MediaStatus, TimeMode } from "../types";
import {
  PLAY,
  STOP,
  PAUSE,
  IS_STOPPED,
  IS_PLAYING,
  SET_VOLUME,
  SET_BALANCE,
  SET_MEDIA,
  TOGGLE_REPEAT,
  TOGGLE_SHUFFLE,
  TOGGLE_TIME_MODE,
  UPDATE_TIME_ELAPSED,
  LOAD_SERIALIZED_STATE,
} from "../actionTypes";
import { TIME_MODE, MEDIA_STATUS } from "../constants";
import { MediaSerializedStateV1 } from "../serializedStates/v1Types";

export interface MediaState {
  timeMode: TimeMode; // TODO: Convert this to an enum
  timeElapsed: number;
  volume: number;
  balance: number;
  shuffle: boolean;
  repeat: boolean;
  status: MediaStatus;
}

const defaultState = {
  timeMode: TIME_MODE.ELAPSED,
  timeElapsed: 0,

  // The winamp ini file declares the default volume as "200".
  // The UI seems to show a default volume near 78, which would
  // math with the default value being 200 out of 255.
  volume: Math.round((200 / 255) * 100),
  balance: 0,
  shuffle: false,
  repeat: false,
  // TODO: Enforce possible values
  status: MEDIA_STATUS.STOPPED,
};

const media = (
  state: MediaState = defaultState,
  action: Action
): MediaState => {
  switch (action.type) {
    // TODO: Make these constants
    case PLAY:
    case IS_PLAYING:
      return { ...state, status: MEDIA_STATUS.PLAYING };
    case PAUSE:
      return { ...state, status: MEDIA_STATUS.PAUSED };
    case STOP:
    case IS_STOPPED:
      return { ...state, status: MEDIA_STATUS.STOPPED };
    case TOGGLE_TIME_MODE:
      const newMode =
        state.timeMode === TIME_MODE.REMAINING
          ? TIME_MODE.ELAPSED
          : TIME_MODE.REMAINING;
      return { ...state, timeMode: newMode };
    case UPDATE_TIME_ELAPSED:
      return { ...state, timeElapsed: action.elapsed };
    case SET_MEDIA:
      return {
        ...state,
      };
    case SET_VOLUME:
      return { ...state, volume: action.volume };
    case SET_BALANCE:
      return { ...state, balance: action.balance };
    case TOGGLE_REPEAT:
      return { ...state, repeat: !state.repeat };
    case TOGGLE_SHUFFLE:
      return { ...state, shuffle: !state.shuffle };
    case LOAD_SERIALIZED_STATE:
      return { ...state, ...action.serializedState.media };
    default:
      return state;
  }
};

export function getSerializedState(state: MediaState): MediaSerializedStateV1 {
  const { volume, balance, shuffle, repeat } = state;
  return { volume, balance, shuffle, repeat };
}

export default media;
