import {
  getWindowGraph,
  getWindowSizes,
  getWindowPositions
} from "../selectors";

import { objectMap } from "../utils";
import {
  UPDATE_WINDOW_POSITIONS,
  TOGGLE_DOUBLESIZE_MODE,
  WINDOW_SIZE_CHANGED,
  TOGGLE_WINDOW,
  CLOSE_WINDOW,
  TOGGLE_WINDOW_SHADE_MODE,
  HIDE_WINDOW,
  SHOW_WINDOW
} from "../actionTypes";

import { getPositionDiff } from "../resizeUtils";
import { applyDiff } from "../snapUtils";

// Dispatch an action and, if needed rearrange the windows to preserve
// the existing edge relationship.
//
// Works by checking the edges before the action is dispatched. Then,
// after disatching, calculating what position change would be required
// to restore those relationships.
function withWindowGraphIntegrity(action) {
  return (dispatch, getState) => {
    const state = getState();
    const graph = getWindowGraph(state);
    const originalSizes = getWindowSizes(state);

    dispatch(action);

    const newSizes = getWindowSizes(getState());
    const sizeDiff = {};
    for (const window of Object.keys(newSizes)) {
      const original = originalSizes[window];
      const current = newSizes[window];
      sizeDiff[window] = {
        height: current.height - original.height,
        width: current.width - original.width
      };
    }

    const positionDiff = getPositionDiff(graph, sizeDiff);
    const windowPositions = getWindowPositions(state);

    const newPositions = objectMap(windowPositions, (position, key) =>
      applyDiff(position, positionDiff[key])
    );

    dispatch(updateWindowPositions(newPositions));
  };
}

export function toggleDoubleSizeMode() {
  return withWindowGraphIntegrity({ type: TOGGLE_DOUBLESIZE_MODE });
}

export function toggleEqualizerShadeMode() {
  return withWindowGraphIntegrity({
    type: TOGGLE_WINDOW_SHADE_MODE,
    windowId: "equalizer"
  });
}

export function toggleMainWindowShadeMode() {
  return withWindowGraphIntegrity({
    type: TOGGLE_WINDOW_SHADE_MODE,
    windowId: "main"
  });
}

export function togglePlaylistShadeMode() {
  return withWindowGraphIntegrity({
    type: TOGGLE_WINDOW_SHADE_MODE,
    windowId: "playlist"
  });
}

export function closeWindow(windowId) {
  return { type: CLOSE_WINDOW, windowId };
}

export function hideWindow(windowId) {
  return { type: HIDE_WINDOW, windowId };
}

export function showWindow(windowId) {
  return { type: SHOW_WINDOW, windowId };
}

export function setWindowSize(windowId, size) {
  return { type: WINDOW_SIZE_CHANGED, windowId, size };
}

export function toggleWindow(windowId) {
  return { type: TOGGLE_WINDOW, windowId };
}

export function updateWindowPositions(positions) {
  return { type: UPDATE_WINDOW_POSITIONS, positions };
}
