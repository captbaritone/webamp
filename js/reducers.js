import { combineReducers } from "redux";
import { BANDS, WINDOWS } from "./constants";
import {
  CLOSE_WINAMP,
  SET_BALANCE,
  SET_BAND_VALUE,
  SET_FOCUS,
  SET_BAND_FOCUS,
  SET_FOCUSED_WINDOW,
  SET_MEDIA,
  SET_SCRUB_POSITION,
  SET_SKIN_DATA,
  SET_VOLUME,
  START_LOADING,
  START_WORKING,
  STEP_MARQUEE,
  STOP_WORKING,
  TOGGLE_DOUBLESIZE_MODE,
  TOGGLE_EQUALIZER_WINDOW,
  CLOSE_EQUALIZER_WINDOW,
  TOGGLE_PLAYLIST_WINDOW,
  SET_EQ_AUTO,
  SET_EQ_ON,
  SET_EQ_OFF,
  TOGGLE_LLAMA_MODE,
  TOGGLE_REPEAT,
  TOGGLE_SHADE_MODE,
  TOGGLE_EQUALIZER_SHADE_MODE,
  TOGGLE_PLAYLIST_SHADE_MODE,
  TOGGLE_SHUFFLE,
  TOGGLE_TIME_MODE,
  TOGGLE_VISUALIZER_STYLE,
  UNSET_FOCUS,
  UPDATE_TIME_ELAPSED,
  SET_USER_MESSAGE,
  UNSET_USER_MESSAGE,
  SET_PLAYLIST_SCROLL_POSITION,
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK,
  SELECT_ALL,
  SELECT_ZERO,
  INVERT_SELECTION,
  PLAYLIST_SIZE_CHANGED,
  REMOVE_ALL_TRACKS,
  REMOVE_TRACKS,
  SET_AVALIABLE_SKINS,
  LOAD_AUDIO_FILE,
  LOAD_AUDIO_URL,
  REVERSE_LIST,
  RANDOMIZE_LIST,
  SET_TRACK_ORDER
} from "./actionTypes";
import { playlistEnabled } from "./config";
import { shuffle } from "./utils";

const mapObject = (obj, iteratee) =>
  // TODO: Could return the original reference if no values change
  Object.keys(obj).reduce((newObj, key) => {
    newObj[key] = iteratee(obj[key], key);
    return newObj;
  }, {});

const filterObject = (obj, predicate) =>
  // TODO: Could return the original reference if no values change
  Object.keys(obj).reduce((newObj, key) => {
    if (predicate(obj[key], key)) {
      newObj[key] = obj[key];
    }
    return newObj;
  }, {});

const defaultUserInput = {
  focus: null,
  bandFocused: null,
  scrubPosition: 0,
  userMessage: null
};

export const userInput = (state = defaultUserInput, action) => {
  switch (action.type) {
    case SET_FOCUS:
      return { ...state, focus: action.input, bandFocused: null };
    case SET_BAND_FOCUS:
      return { ...state, focus: action.input, bandFocused: action.bandFocused };
    case UNSET_FOCUS:
      return { ...state, focus: null, bandFocused: null };
    case SET_SCRUB_POSITION:
      return { ...state, scrubPosition: action.position };
    case SET_USER_MESSAGE:
      return { ...state, userMessage: action.message };
    case UNSET_USER_MESSAGE:
      return { ...state, userMessage: null };
    default:
      return state;
  }
};

const defaultWindowsState = {
  focused: WINDOWS.MAIN,
  equalizer: true,
  playlist: playlistEnabled
};

const windows = (state = defaultWindowsState, action) => {
  switch (action.type) {
    case SET_FOCUSED_WINDOW:
      return { ...state, focused: action.window };
    case TOGGLE_EQUALIZER_WINDOW:
      return { ...state, equalizer: !state.equalizer };
    case CLOSE_EQUALIZER_WINDOW:
      return { ...state, equalizer: false };
    case TOGGLE_PLAYLIST_WINDOW:
      if (!playlistEnabled) {
        return state;
      }
      return { ...state, playlist: !state.playlist };
    default:
      return state;
  }
};

const defaultDisplayState = {
  doubled: false,
  marqueeStep: 0,
  loading: true,
  llama: false,
  closed: false,
  shade: false,
  equalizerShade: false,
  playlistShade: false,
  working: false,
  skinImages: {},
  skinColors: null,
  skinCursors: null,
  skinPlaylistStyle: {},
  skinRegion: {},
  visualizerStyle: 2,
  playlistScrollPosition: 0,
  playlistSize: [0, 0]
};

const display = (state = defaultDisplayState, action) => {
  switch (action.type) {
    case TOGGLE_DOUBLESIZE_MODE:
      return { ...state, doubled: !state.doubled };
    case TOGGLE_SHADE_MODE:
      return { ...state, shade: !state.shade };
    case TOGGLE_EQUALIZER_SHADE_MODE:
      return { ...state, equalizerShade: !state.equalizerShade };
    case TOGGLE_PLAYLIST_SHADE_MODE:
      return { ...state, playlistShade: !state.playlistShade };
    case TOGGLE_LLAMA_MODE:
      return { ...state, llama: !state.llama };
    case STEP_MARQUEE:
      // TODO: Prevent this from becoming huge
      return { ...state, marqueeStep: state.marqueeStep + 1 };
    case STOP_WORKING:
      return { ...state, working: false };
    case START_WORKING:
      return { ...state, working: true };
    case START_LOADING:
      return { ...state, loading: true };
    case CLOSE_WINAMP:
      return { ...state, closed: true };
    case SET_SKIN_DATA:
      return {
        ...state,
        loading: false,
        skinImages: action.skinImages,
        skinColors: action.skinColors,
        skinPlaylistStyle: action.skinPlaylistStyle,
        skinCursors: action.skinCursors,
        skinRegion: action.skinRegion
      };
    case TOGGLE_VISUALIZER_STYLE:
      return { ...state, visualizerStyle: (state.visualizerStyle + 1) % 3 };
    case SET_PLAYLIST_SCROLL_POSITION:
      return { ...state, playlistScrollPosition: action.position };
    case PLAYLIST_SIZE_CHANGED:
      return { ...state, playlistSize: action.size };
    default:
      return state;
  }
};

const defaultSettingsState = {
  avaliableSkins: []
};

const settings = (state = defaultSettingsState, action) => {
  switch (action.type) {
    case SET_AVALIABLE_SKINS:
      return { ...state, avaliableSkins: action.skins };
    default:
      return state;
  }
};

const equalizer = (state, action) => {
  if (!state) {
    state = {
      on: true,
      auto: false,
      sliders: {
        preamp: 50
      }
    };
    BANDS.forEach(band => {
      state.sliders[band] = 50;
    });
    return state;
  }
  switch (action.type) {
    case SET_BAND_VALUE:
      const newSliders = { ...state.sliders, [action.band]: action.value };
      return { ...state, sliders: newSliders };
    case SET_EQ_ON:
      return { ...state, on: true };
    case SET_EQ_OFF:
      return { ...state, on: false };
    case SET_EQ_AUTO:
      return { ...state, auto: action.value };
    default:
      return state;
  }
};

// Dummy data for now
const defaultTracksState = {
  "0": {
    selected: false,
    title: "Llama Whipping Intro",
    artist: "DJ Mike Llama",
    duration: "221"
  },
  "1": {
    selected: false,
    title: "Rock Is Dead",
    artist: "Marilyn Manson",
    duration: "221"
  },
  "2": {
    selected: true,
    title: "Spybreak! (Short One)",
    artist: "Propellerheads",
    duration: "171"
  },
  "3": {
    selected: false,
    title: "Clubbed to Death",
    artist: "Rob D",
    duration: "215"
  },
  "4": {
    selected: false,
    title: "Leave You Far Behind",
    artist: "Lunatic Calm",
    duration: "174"
  },
  "5": {
    selected: false,
    title: "Dragula",
    artist: "Rob Zombie",
    duration: "484"
  },
  "6": {
    selected: false,
    title: "Ultrasonic Sound",
    artist: "Hive",
    duration: "152"
  },
  "7": {
    selected: false,
    title: "Du hast",
    artist: "Rammstein",
    duration: "214"
  }
};

const tracks = (state = defaultTracksState, action) => {
  switch (action.type) {
    case CLICKED_TRACK:
      return mapObject(state, (track, id) => ({
        ...track,
        selected: id === String(action.id)
      }));
    case CTRL_CLICKED_TRACK:
      const t = state[action.id];
      return {
        ...state,
        [action.id]: { ...t, selected: !t.selected }
      };
    case SELECT_ALL:
      return mapObject(state, track => ({ ...track, selected: true }));
    case SELECT_ZERO:
      return mapObject(state, track => ({ ...track, selected: false }));
    case INVERT_SELECTION:
      return mapObject(state, track => ({
        ...track,
        selected: !track.selected
      }));
    case REMOVE_ALL_TRACKS:
      return {};
    case REMOVE_TRACKS:
      return filterObject(state, (track, id) => !action.ids.includes(id));
    default:
      return state;
  }
};

const defaultPlaylistState = {
  trackOrder: [0, 1, 2, 3, 4, 5, 6],
  currentTrack: 0
};
const playlist = (state = defaultPlaylistState, action) => {
  switch (action.type) {
    case REMOVE_ALL_TRACKS:
      return { ...state, trackOrder: [], currentTrack: null };
    case REMOVE_TRACKS:
      return {
        ...state,
        trackOrder: state.trackOrder.filter(id => !action.ids.includes(id))
      };
    case REVERSE_LIST:
      return {
        ...state,
        trackOrder: [...state.trackOrder].reverse()
      };
    case RANDOMIZE_LIST:
      return {
        ...state,
        trackOrder: shuffle(state.trackOrder)
      };
    case SET_TRACK_ORDER:
      const { trackOrder } = action;
      return { ...state, trackOrder };

    default:
      return state;
  }
};

const media = (state, action) => {
  if (!state) {
    return {
      timeMode: "ELAPSED",
      timeElapsed: 0,
      length: null, // Consider renaming to "duration"
      kbps: null,
      khz: null,
      volume: 50,
      balance: 0,
      name: "",
      channels: null,
      shuffle: false,
      repeat: false,
      // TODO: Enforce possible values
      status: "STOPPED"
    };
  }
  switch (action.type) {
    case "PLAY":
    case "IS_PLAYING":
      return { ...state, status: "PLAYING" };
    case "PAUSE":
      return { ...state, status: "PAUSED" };
    case "STOP":
    case "IS_STOPPED":
      return { ...state, status: "STOPPED" };
    case TOGGLE_TIME_MODE:
      const newMode = state.timeMode === "REMAINING" ? "ELAPSED" : "REMAINING";
      return { ...state, timeMode: newMode };
    case UPDATE_TIME_ELAPSED:
      return { ...state, timeElapsed: action.elapsed };
    case LOAD_AUDIO_FILE:
    case LOAD_AUDIO_URL:
      return {
        ...state,
        timeElapsed: 0,
        length: null,
        kbps: null,
        khz: null,
        channels: null,
        name: null
      };
    case SET_MEDIA:
      return {
        ...state,
        length: action.length,
        kbps: action.kbps,
        khz: action.khz,
        channels: action.channels,
        name: action.name
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

const reducer = combineReducers({
  userInput,
  windows,
  display,
  settings,
  equalizer,
  tracks,
  playlist,
  media
});

export default reducer;
