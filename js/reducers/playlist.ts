import { PlaylistTrack, Action } from "../types";
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
import { shuffle, moveSelected, objectMap, objectFilter } from "../utils";

export interface PlaylistState {
  trackOrder: number[];
  tracks: { [id: string]: PlaylistTrack };
  lastSelectedIndex: number | null;
  currentTrack: number | null;
  selectedTracks: Set<number>;
}

const defaultPlaylistState: PlaylistState = {
  trackOrder: [],
  currentTrack: null,
  tracks: {},
  lastSelectedIndex: null,
  selectedTracks: new Set()
};

function toggleSetMembership<T>(set: Set<T>, value: T): void {
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
}

const playlist = (
  state: PlaylistState = defaultPlaylistState,
  action: Action
): PlaylistState => {
  switch (action.type) {
    case CLICKED_TRACK:
      return {
        ...state,
        selectedTracks: new Set([state.trackOrder[action.index]]),
        lastSelectedIndex: action.index
      };
    case CTRL_CLICKED_TRACK:
      const id = state.trackOrder[action.index];
      const newSelectedTracks = new Set(state.selectedTracks);
      toggleSetMembership(newSelectedTracks, id);
      return {
        ...state,
        selectedTracks: newSelectedTracks,
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
      const selectedTracks = new Set(state.trackOrder.slice(start, end + 1));
      return {
        ...state,
        selectedTracks
      };
    case SELECT_ALL:
      return {
        ...state,
        selectedTracks: new Set(state.trackOrder)
      };
    case SELECT_ZERO:
      return {
        ...state,
        selectedTracks: new Set()
      };
    case INVERT_SELECTION:
      return {
        ...state,
        selectedTracks: new Set(
          state.trackOrder.filter(id => !state.selectedTracks.has(id))
        )
      };
    case REMOVE_ALL_TRACKS:
      // TODO: Consider disposing of ObjectUrls
      return {
        ...state,
        trackOrder: [],
        currentTrack: null,
        tracks: {},
        selectedTracks: new Set(),
        lastSelectedIndex: null
      };
    case REMOVE_TRACKS:
      // TODO: Consider disposing of ObjectUrls
      const actionIds = new Set(action.ids.map(Number));
      const { currentTrack } = state;
      return {
        ...state,
        trackOrder: state.trackOrder.filter(trackId => !actionIds.has(trackId)),
        currentTrack: actionIds.has(Number(currentTrack)) ? null : currentTrack,
        tracks: objectFilter(
          state.tracks,
          (track, trackId) => !actionIds.has(Number(trackId))
        ),
        selectedTracks: new Set(
          Array.from(state.selectedTracks).filter(id => actionIds.has(id))
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
            defaultName: action.defaultName || null,
            duration: action.duration == null ? null : action.duration,
            url: action.url,
            mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.INITIALIZED
          }
        },
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null
      };
    case SET_MEDIA: {
      const newTrack = {
        ...state.tracks[action.id],
        duration: action.length
      };
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [action.id]: newTrack
        }
      };
    }
    case SET_MEDIA_TAGS: {
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [action.id]: {
            ...state.tracks[action.id],
            mediaTagsRequestStatus: MEDIA_TAG_REQUEST_STATUS.COMPLETE,
            title: action.title,
            artist: action.artist,
            album: action.album,
            albumArtUrl: action.albumArtUrl
          }
        }
      };
    }
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
    case SET_MEDIA_DURATION: {
      const newTrack = {
        ...state.tracks[action.id],
        duration: action.duration
      };
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [action.id]: newTrack
        }
      };
    }
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
          i => state.selectedTracks.has(state.trackOrder[i]),
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

export const getTrackDisplayName = (
  state: PlaylistState,
  id: number | null = null
): string | null => {
  if (id == null) {
    return null;
  }
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
