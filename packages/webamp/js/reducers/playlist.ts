import { Action } from "../types";
import { shuffle, moveSelected } from "../utils";

export interface PlaylistState {
  trackOrder: number[];
  lastSelectedIndex: number | null;
  currentTrack: number | null;
  selectedTracks: number[];
}

const defaultPlaylistState: PlaylistState = {
  trackOrder: [],
  currentTrack: null,
  lastSelectedIndex: null,
  selectedTracks: [],
};

const playlist = (
  state: PlaylistState = defaultPlaylistState,
  action: Action
): PlaylistState => {
  switch (action.type) {
    case "CLICKED_TRACK":
      return {
        ...state,
        selectedTracks: [state.trackOrder[(action as any).index]],
        lastSelectedIndex: (action as any).index,
      };
    case "CTRL_CLICKED_TRACK": {
      const id = state.trackOrder[(action as any).index];
      const index = state.selectedTracks.indexOf(id);
      const newSelectedTracks = [...state.selectedTracks];
      if (index === -1) {
        newSelectedTracks.push(id);
      } else {
        newSelectedTracks.splice(index, 1);
      }
      return {
        ...state,
        selectedTracks: newSelectedTracks,
        // Using this as the lastClickedIndex is kinda funny, since you
        // may have just _un_selected the track. However, this is what
        // Winamp 2 does, so we'll copy it.
        lastSelectedIndex: (action as any).index,
      };
    }
    case "SHIFT_CLICKED_TRACK":
      if (state.lastSelectedIndex == null) {
        return state;
      }
      const clickedIndex = (action as any).index;
      const start = Math.min(clickedIndex, state.lastSelectedIndex);
      const end = Math.max(clickedIndex, state.lastSelectedIndex);
      const selectedTracks = state.trackOrder.slice(start, end + 1);
      return {
        ...state,
        selectedTracks,
      };
    case "SELECT_ALL":
      return {
        ...state,
        selectedTracks: [...state.trackOrder],
      };
    case "SELECT_ZERO":
      return {
        ...state,
        selectedTracks: [],
      };
    case "INVERT_SELECTION":
      return {
        ...state,
        selectedTracks: state.trackOrder.filter(
          (id) => !state.selectedTracks.includes(id)
        ),
      };
    case "REMOVE_ALL_TRACKS":
      // TODO: Consider disposing of ObjectUrls
      return {
        ...state,
        trackOrder: [],
        currentTrack: null,
        selectedTracks: [],
        lastSelectedIndex: null,
      };
    case "REMOVE_TRACKS":
      // TODO: Consider disposing of ObjectUrls
      const actionIds = new Set((action as any).ids.map(Number));
      const { currentTrack } = state;
      return {
        ...state,
        trackOrder: state.trackOrder.filter(
          (trackId) => !actionIds.has(trackId)
        ),
        currentTrack: actionIds.has(Number(currentTrack)) ? null : currentTrack,
        selectedTracks: Array.from(state.selectedTracks).filter((id) =>
          actionIds.has(id)
        ),
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null,
      };
    case "REVERSE_LIST":
      return {
        ...state,
        trackOrder: [...state.trackOrder].reverse(),
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null,
      };
    case "RANDOMIZE_LIST":
      return {
        ...state,
        trackOrder: shuffle(state.trackOrder),
      };
    case "SET_TRACK_ORDER":
      const { trackOrder } = action as any;
      return { ...state, trackOrder };
    case "ADD_TRACK_FROM_URL":
      const atIndex =
        (action as any).atIndex == null
          ? state.trackOrder.length
          : (action as any).atIndex;
      return {
        ...state,
        trackOrder: [
          ...state.trackOrder.slice(0, atIndex),
          Number((action as any).id),
          ...state.trackOrder.slice(atIndex),
        ],
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null,
      };
    case "PLAY_TRACK":
    case "BUFFER_TRACK":
      return {
        ...state,
        currentTrack: (action as any).id,
      };
    case "DRAG_SELECTED":
      return {
        ...state,
        trackOrder: moveSelected(
          state.trackOrder,
          (i) => state.selectedTracks.includes(state.trackOrder[i]),
          (action as any).offset
        ),
        // TODO: This could probably be made to work, but we clear it just to be safe.
        lastSelectedIndex: null,
      };
    default:
      return state;
  }
};

export default playlist;
