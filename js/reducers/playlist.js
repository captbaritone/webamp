import {
  SET_MEDIA,
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK,
  SELECT_ALL,
  SELECT_ZERO,
  INVERT_SELECTION,
  REMOVE_ALL_TRACKS,
  REMOVE_TRACKS,
  LOAD_AUDIO_URL,
  REVERSE_LIST,
  RANDOMIZE_LIST,
  SET_TRACK_ORDER,
  PLAY_TRACK,
  DRAG_SELECTED
} from "../actionTypes";

import { shuffle } from "../utils";

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

const defaultPlaylistState = {
  trackOrder: [],
  currentTrackIndex: null,
  tracks: {}
};

const playlist = (state = defaultPlaylistState, action) => {
  switch (action.type) {
    case CLICKED_TRACK:
      return {
        ...state,
        tracks: mapObject(state.tracks, (track, id) => ({
          ...track,
          selected: id === String(action.id)
        }))
      };
    case CTRL_CLICKED_TRACK:
      const t = state.tracks[action.id];
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [action.id]: { ...t, selected: !t.selected }
        }
      };
    case SELECT_ALL:
      return {
        ...state,
        tracks: mapObject(state.tracks, track => ({ ...track, selected: true }))
      };
    case SELECT_ZERO:
      return {
        ...state,
        tracks: mapObject(state.tracks, track => ({
          ...track,
          selected: false
        }))
      };
    case INVERT_SELECTION:
      return {
        ...state,
        tracks: mapObject(state.tracks, track => ({
          ...track,
          selected: !track.selected
        }))
      };
    case REMOVE_ALL_TRACKS:
      // TODO: Consider disposing of ObjectUrls
      return { ...state, trackOrder: [], currentTrackIndex: null, tracks: {} };
    case REMOVE_TRACKS:
      // TODO: Consider disposing of ObjectUrls
      const actionIds = action.ids.map(Number);
      let { currentTrackIndex } = state;
      const filteredTrackOrder = state.trackOrder.filter((id, i) => {
        if (i === currentTrackIndex) {
          // This is super janky: Using the .filter callback to do unrelated stuff.
          // This is what you get when code reviews are not required.
          currentTrackIndex = null;
        }
        return !actionIds.includes(id);
      });
      return {
        ...state,
        trackOrder: filteredTrackOrder,
        currentTrackIndex,
        tracks: filterObject(
          state.tracks,
          (track, id) => !action.ids.includes(id)
        )
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
    case LOAD_AUDIO_URL:
      return {
        ...state,
        trackOrder: [...state.trackOrder, Number(action.id)],
        currentTrackIndex: state.trackOrder.length,
        tracks: {
          ...state.tracks,
          [action.id]: {
            selected: false,
            title: action.name,
            duration: null,
            url: action.url
          }
        }
      };
    case SET_MEDIA:
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [action.id]: {
            ...state.tracks[action.id],
            duration: action.length
          }
        }
      };
    case PLAY_TRACK:
      return {
        ...state,
        currentTrackIndex: state.trackOrder.findIndex(
          id => id === Number(action.id)
        )
      };
    case DRAG_SELECTED:
      return state;

    default:
      return state;
  }
};

export default playlist;
