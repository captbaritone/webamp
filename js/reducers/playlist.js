import {
  SET_MEDIA,
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK,
  SHIFT_CLICKED_TRACK,
  SELECT_ALL,
  SELECT_ZERO,
  INVERT_SELECTION,
  REMOVE_ALL_TRACKS,
  REMOVE_TRACKS,
  ADD_TRACK_FROM_URL,
  REVERSE_LIST,
  RANDOMIZE_LIST,
  SET_TRACK_ORDER,
  PLAY_TRACK,
  BUFFER_TRACK,
  DRAG_SELECTED,
  SET_MEDIA_TAGS,
  SET_MEDIA_DURATION,
  MEDIA_TAG_REQUEST_INITIALIZED,
  MEDIA_TAG_REQUEST_FAILED
} from "../actionTypes";
import { MEDIA_TAG_REQUEST_STATUS } from "../constants";

import { filenameFromUrl } from "../fileUtils";
import { shuffle, moveSelected, mapObject, filterObject } from "../utils";

const defaultPlaylistState = {
  trackOrder: [],
  currentTrack: null,
  tracks: {},
  lastSelectedIndex: null
};

const playlist = (state = defaultPlaylistState, action) => {
  switch (action.type) {
    case CLICKED_TRACK:
      const clickedId = String(state.trackOrder[action.index]);
      return {
        ...state,
        tracks: mapObject(state.tracks, (track, id) => ({
          ...track,
          selected: id === clickedId
        })),
        lastSelectedIndex: action.index
      };
    case CTRL_CLICKED_TRACK:
      const id = state.trackOrder[action.index];
      const t = state.tracks[id];
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [id]: { ...t, selected: !t.selected }
        },
        // Using this as the lastClickedIndex is kinda funny, since you
        // may have just _un_selected the track. However, this is what
        // Winamp 2 does, so we'll copy it.
        lastSelectedIndex: action.index
      };
    case SHIFT_CLICKED_TRACK:
      if (state.lastSelectedIndex == null) {
        return state;
      }
      const clickedIndex = action.index;
      const start = Math.min(clickedIndex, state.lastSelectedIndex);
      const end = Math.max(clickedIndex, state.lastSelectedIndex);
      const selected = new Set(state.trackOrder.slice(start, end + 1));
      return {
        ...state,
        tracks: mapObject(state.tracks, (track, trackId) => ({
          ...track,
          selected: selected.has(Number(trackId))
        }))
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
      return {
        ...state,
        trackOrder: [],
        currentTrack: null,
        tracks: {},
        lastSelectedIndex: null
      };
    case REMOVE_TRACKS:
      // TODO: Consider disposing of ObjectUrls
      const actionIds = action.ids.map(Number);
      const { currentTrack } = state;
      return {
        ...state,
        trackOrder: state.trackOrder.filter(
          trackId => !actionIds.includes(trackId)
        ),
        currentTrack: actionIds.includes(currentTrack) ? null : currentTrack,
        tracks: filterObject(
          state.tracks,
          (track, trackId) => !action.ids.includes(trackId)
        ),
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null
      };
    case REVERSE_LIST:
      return {
        ...state,
        trackOrder: [...state.trackOrder].reverse(),
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null
      };
    case RANDOMIZE_LIST:
      return {
        ...state,
        trackOrder: shuffle(state.trackOrder)
      };
    case SET_TRACK_ORDER:
      const { trackOrder } = action;
      return { ...state, trackOrder };
    case ADD_TRACK_FROM_URL:
      const atIndex =
        action.atIndex == null ? state.trackOrder.length : action.atIndex;
      return {
        ...state,
        trackOrder: [
          ...state.trackOrder.slice(0, atIndex),
          Number(action.id),
          ...state.trackOrder.slice(atIndex)
        ],
        tracks: {
          ...state.tracks,
          [action.id]: {
            id: action.id,
            selected: false,
            defaultName: action.defaultName,
            duration: null,
            url: action.url,
            mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.NOT_REQUESTED
          }
        },
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null
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
    case SET_MEDIA_TAGS:
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [action.id]: {
            ...state.tracks[action.id],
            mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.COMPLETE,
            title: action.title,
            artist: action.artist
          }
        }
      };
    case MEDIA_TAG_REQUEST_INITIALIZED:
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [action.id]: {
            ...state.tracks[action.id],
            mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.INITIALIZED
          }
        }
      };
    case MEDIA_TAG_REQUEST_FAILED:
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [action.id]: {
            ...state.tracks[action.id],
            mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.FAILED
          }
        }
      };
    case SET_MEDIA_DURATION:
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [action.id]: {
            ...state.tracks[action.id],
            duration: action.duration
          }
        }
      };
    case PLAY_TRACK:
    case BUFFER_TRACK:
      return {
        ...state,
        currentTrack: action.id
      };
    case DRAG_SELECTED:
      return {
        ...state,
        trackOrder: moveSelected(
          state.trackOrder,
          i => state.tracks[state.trackOrder[i]].selected,
          action.offset
        ),
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null
      };
    default:
      return state;
  }
};

export default playlist;

export const getTrackDisplayName = (state, id) => {
  const track = state.tracks[id];
  if (track == null) {
    return null;
  }
  const { artist, title, defaultName, url } = track;
  if (artist && title) {
    return `${artist} - ${title}`;
  } else if (title) {
    return title;
  } else if (defaultName) {
    return defaultName;
  } else if (url) {
    const filename = filenameFromUrl(url);
    if (filename) {
      return filename;
    }
  }
  return "???";
};
