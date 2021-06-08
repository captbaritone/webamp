import { TRACK_HEIGHT } from "../constants";
import * as Selectors from "../selectors";

import { clamp, sort, findLastIndex } from "../utils";
import {
  STOP,
  REMOVE_TRACKS,
  REMOVE_ALL_TRACKS,
  REVERSE_LIST,
  RANDOMIZE_LIST,
  SET_TRACK_ORDER,
  SET_PLAYLIST_SCROLL_POSITION,
  DRAG_SELECTED,
  SELECT_ALL,
  SELECT_ZERO,
  INVERT_SELECTION,
} from "../actionTypes";
import { Thunk, Action } from "../types";

export function cropPlaylist(): Thunk {
  return (dispatch, getState) => {
    const state = getState();
    if (Selectors.getSelectedTrackObjects(state).length === 0) {
      return;
    }
    const selectedTrackIds = Selectors.getSelectedTrackIds(state);
    const {
      playlist: { trackOrder },
    } = state;
    dispatch({
      type: REMOVE_TRACKS,
      // @ts-ignore The keys are numbers, but TypeScript does not trust us.
      // https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-263132208
      ids: trackOrder.filter((id) => !selectedTrackIds.has(id)),
    });
  };
}

export function removeSelectedTracks(): Thunk {
  return (dispatch, getState) => {
    dispatch({
      type: REMOVE_TRACKS,
      // @ts-ignore The keys are numbers, but TypeScript does not trust us.
      // https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-263132208
      ids: Array.from(Selectors.getSelectedTrackIds(getState())),
    });
  };
}

export function removeAllTracks(): Thunk {
  return (dispatch) => {
    // It's a bit funky that we need to do both of these.
    dispatch({ type: STOP });
    dispatch({ type: REMOVE_ALL_TRACKS });
  };
}

export function reverseList(): Action {
  return { type: REVERSE_LIST };
}

export function randomizeList(): Action {
  return { type: RANDOMIZE_LIST };
}

export function sortListByTitle(): Thunk {
  return (dispatch, getState) => {
    const state = getState();
    const tracks = Selectors.getTracks(state);
    const trackOrder = sort(Selectors.getTrackOrder(state), (i) =>
      `${tracks[i].title}`.toLowerCase()
    );
    return dispatch({ type: SET_TRACK_ORDER, trackOrder });
  };
}

export function setPlaylistScrollPosition(position: number): Action {
  return { type: SET_PLAYLIST_SCROLL_POSITION, position };
}

export function scrollNTracks(n: number): Thunk {
  return (dispatch, getState) => {
    const state = getState();
    const overflow = Selectors.getOverflowTrackCount(state);
    const currentOffset = Selectors.getScrollOffset(state);
    const position = overflow ? clamp((currentOffset + n) / overflow, 0, 1) : 0;
    return dispatch({
      type: SET_PLAYLIST_SCROLL_POSITION,
      position: position * 100,
    });
  };
}

export function scrollPlaylistByDelta(e: WheelEvent): Thunk {
  e.preventDefault();
  return (dispatch, getState) => {
    const state = getState();
    if (Selectors.getOverflowTrackCount(state)) {
      e.stopPropagation();
    }
    const totalPixelHeight = state.playlist.trackOrder.length * TRACK_HEIGHT;
    const percentDelta = (e.deltaY / totalPixelHeight) * 100;
    dispatch({
      type: SET_PLAYLIST_SCROLL_POSITION,
      position: clamp(
        state.display.playlistScrollPosition + percentDelta,
        0,
        100
      ),
    });
  };
}

export function scrollUpFourTracks(): Thunk {
  return scrollNTracks(-4);
}

export function scrollDownFourTracks(): Thunk {
  return scrollNTracks(4);
}

export function dragSelected(offset: number): Thunk {
  return (dispatch, getState) => {
    const state = getState();
    const tracks = Selectors.getTracks(state);
    const trackOrder = Selectors.getTrackOrder(state);
    const selectedIds = Selectors.getSelectedTrackIds(state);
    const firstSelected = trackOrder.findIndex(
      (trackId) => tracks[trackId] && selectedIds.has(trackId)
    );
    if (firstSelected === -1) {
      return;
    }
    const lastSelected = findLastIndex(
      trackOrder,
      (trackId) => tracks[trackId] && selectedIds.has(trackId)
    );
    if (lastSelected === -1) {
      throw new Error("We found a first selected, but not a last selected.");
    }
    // Ensure we don't try to drag off either end.
    const min = -firstSelected;
    const max = trackOrder.length - 1 - lastSelected;
    const normalizedOffset = clamp(offset, min, max);
    if (normalizedOffset !== 0) {
      dispatch({ type: DRAG_SELECTED, offset: normalizedOffset });
    }
  };
}

export function invertSelection(): Action {
  return { type: INVERT_SELECTION };
}
export function selectZero(): Action {
  return { type: SELECT_ZERO };
}

export function selectAll(): Action {
  return { type: SELECT_ALL };
}
