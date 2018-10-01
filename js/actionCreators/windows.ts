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
  SET_WINDOW_VISIBILITY
} from "../actionTypes";

import { getPositionDiff, SizeDiff } from "../resizeUtils";
import { applyDiff } from "../snapUtils";
import { Action, Dispatchable, WindowId, WindowPositions } from "../types";

// Dispatch an action and, if needed rearrange the windows to preserve
// the existing edge relationship.
//
// Works by checking the edges before the action is dispatched. Then,
// after disatching, calculating what position change would be required
// to restore those relationships.
function withWindowGraphIntegrity(action: Action): Dispatchable {
  return (dispatch, getState) => {
    const state = getState();
    const graph = getWindowGraph(state);
    const originalSizes = getWindowSizes(state);

    dispatch(action);

    const newSizes = getWindowSizes(getState());
    const sizeDiff: SizeDiff = {};
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

export function toggleDoubleSizeMode(): Dispatchable {
  return withWindowGraphIntegrity({ type: TOGGLE_DOUBLESIZE_MODE });
}

export function toggleEqualizerShadeMode(): Dispatchable {
  return withWindowGraphIntegrity({
    type: TOGGLE_WINDOW_SHADE_MODE,
    windowId: "equalizer"
  });
}

export function toggleMainWindowShadeMode(): Dispatchable {
  return withWindowGraphIntegrity({
    type: TOGGLE_WINDOW_SHADE_MODE,
    windowId: "main"
  });
}

export function togglePlaylistShadeMode(): Dispatchable {
  return withWindowGraphIntegrity({
    type: TOGGLE_WINDOW_SHADE_MODE,
    windowId: "playlist"
  });
}

export function closeWindow(windowId: WindowId): Dispatchable {
  return { type: CLOSE_WINDOW, windowId };
}

export function hideWindow(windowId: WindowId): Dispatchable {
  return { type: SET_WINDOW_VISIBILITY, windowId, hidden: true };
}

export function showWindow(windowId: WindowId): Dispatchable {
  return { type: SET_WINDOW_VISIBILITY, windowId, hidden: false };
}

export function setWindowSize(
  windowId: WindowId,
  size: [number, number]
): Dispatchable {
  return { type: WINDOW_SIZE_CHANGED, windowId, size };
}

export function toggleWindow(windowId: WindowId): Dispatchable {
  return { type: TOGGLE_WINDOW, windowId };
}

export function updateWindowPositions(
  positions: WindowPositions
): Dispatchable {
  return { type: UPDATE_WINDOW_POSITIONS, positions };
}
