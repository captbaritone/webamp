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
  ADD_TRACK_FROM_URL
} from "../actionTypes";

const media = (state, action) => {
  if (!state) {
    return {
      timeMode: "ELAPSED",
      timeElapsed: 0,
      length: null, // Consider renaming to "duration"
      kbps: null,
      khz: null,
      // The winamp ini file declares the default volume as "200".
      // The UI seems to show a default volume near 78, which would
      // math with the default value being 200 out of 255.
      volume: Math.round(200 / 255 * 100),
      balance: 0,
      channels: null,
      shuffle: false,
      repeat: false,
      // TODO: Enforce possible values
      status: "STOPPED"
    };
  }
  switch (action.type) {
    // TODO: Make these constants
    case PLAY:
    case IS_PLAYING:
      return { ...state, status: "PLAYING" };
    case PAUSE:
      return { ...state, status: "PAUSED" };
    case STOP:
    case IS_STOPPED:
      return { ...state, status: "STOPPED" };
    case TOGGLE_TIME_MODE:
      const newMode = state.timeMode === "REMAINING" ? "ELAPSED" : "REMAINING";
      return { ...state, timeMode: newMode };
    case UPDATE_TIME_ELAPSED:
      return { ...state, timeElapsed: action.elapsed };
    case ADD_TRACK_FROM_URL:
      return {
        ...state,
        timeElapsed: 0,
        length: null,
        kbps: null,
        khz: null,
        channels: null
      };
    case SET_MEDIA:
      return {
        ...state,
        length: action.length,
        kbps: action.kbps,
        khz: action.khz,
        channels: action.channels
      };
    case SET_VOLUME:
      return { ...state, volume: action.volume };
    case SET_BALANCE:
      return { ...state, balance: action.balance };
    case TOGGLE_REPEAT:
      return { ...state, repeat: !state.repeat };
    case TOGGLE_SHUFFLE:
      return { ...state, shuffle: !state.shuffle };
    default:
      return state;
  }
};

export default media;
