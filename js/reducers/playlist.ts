import { Action } from "../types";
import {
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
} from "../actionTypes";
import { shuffle, moveSelected } from "../utils";

export interface PlaylistState {
  trackOrder: number[];
  lastSelectedIndex: number | null;
  currentTrack: number | null;
  selectedTracks: Set<number>;
}

const defaultPlaylistState: PlaylistState = {
  trackOrder: [],
  currentTrack: null,
  lastSelectedIndex: null,
  selectedTracks: new Set(),
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
        lastSelectedIndex: action.index,
      };
    case CTRL_CLICKED_TRACK: {
      const id = state.trackOrder[action.index];
      const newSelectedTracks = new Set(state.selectedTracks);
      toggleSetMembership(newSelectedTracks, id);
      return {
        ...state,
        selectedTracks: newSelectedTracks,
        // Using this as the lastClickedIndex is kinda funny, since you
        // may have just _un_selected the track. However, this is what
        // Winamp 2 does, so we'll copy it.
        lastSelectedIndex: action.index,
      };
    }
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
        selectedTracks,
      };
    case SELECT_ALL:
      return {
        ...state,
        selectedTracks: new Set(state.trackOrder),
      };
    case SELECT_ZERO:
      return {
        ...state,
        selectedTracks: new Set(),
      };
    case INVERT_SELECTION:
      return {
        ...state,
        selectedTracks: new Set(
          state.trackOrder.filter((id) => !state.selectedTracks.has(id))
        ),
      };
    case REMOVE_ALL_TRACKS:
      // TODO: Consider disposing of ObjectUrls
      return {
        ...state,
        trackOrder: [],
        currentTrack: null,
        selectedTracks: new Set(),
        lastSelectedIndex: null,
      };
    case REMOVE_TRACKS:
      // TODO: Consider disposing of ObjectUrls
      const actionIds = new Set(action.ids.map(Number));
      const { currentTrack } = state;
      return {
        ...state,
        trackOrder: state.trackOrder.filter(
          (trackId) => !actionIds.has(trackId)
        ),
        currentTrack: actionIds.has(Number(currentTrack)) ? null : currentTrack,
        selectedTracks: new Set(
          Array.from(state.selectedTracks).filter((id) => actionIds.has(id))
        ),
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null,
      };
    case REVERSE_LIST:
      return {
        ...state,
        trackOrder: [...state.trackOrder].reverse(),
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null,
      };
    case RANDOMIZE_LIST:
      return {
        ...state,
        trackOrder: shuffle(state.trackOrder),
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
          ...state.trackOrder.slice(atIndex),
        ],
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null,
      };
    case PLAY_TRACK:
    case BUFFER_TRACK:
      return {
        ...state,
        currentTrack: action.id,
      };
    case DRAG_SELECTED:
      return {
        ...state,
        trackOrder: moveSelected(
          state.trackOrder,
          (i) => state.selectedTracks.has(state.trackOrder[i]),
          action.offset
        ),
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null,
      };
    default:
      return state;
  }
};

export default playlist;
