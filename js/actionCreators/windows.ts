import * as Selectors from "../selectors";

import * as Utils from "../utils";
import {
  UPDATE_WINDOW_POSITIONS,
  TOGGLE_DOUBLESIZE_MODE,
  WINDOW_SIZE_CHANGED,
  TOGGLE_WINDOW,
  CLOSE_WINDOW,
  TOGGLE_WINDOW_SHADE_MODE,
  SET_WINDOW_VISIBILITY,
  WINDOWS_HAVE_BEEN_CENTERED,
  BROWSER_WINDOW_SIZE_CHANGED
} from "../actionTypes";

import { getPositionDiff, SizeDiff } from "../resizeUtils";
import { applyDiff } from "../snapUtils";
import { Action, Dispatchable, WindowId, WindowPositions } from "../types";

import { WINDOW_HEIGHT, WINDOW_WIDTH } from "../constants";
import { calculateBoundingBox } from "../utils";

// Dispatch an action and, if needed rearrange the windows to preserve
// the existing edge relationship.
//
// Works by checking the edges before the action is dispatched. Then,
// after disatching, calculating what position change would be required
// to restore those relationships.
function withWindowGraphIntegrity(action: Action): Dispatchable {
  return (dispatch, getState) => {
    const state = getState();
    const graph = Selectors.getWindowGraph(state);
    const originalSizes = Selectors.getWindowSizes(state);

    dispatch(action);

    const newSizes = Selectors.getWindowSizes(getState());
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
    const windowPositions = Selectors.getWindowPositions(state);

    const newPositions = Utils.objectMap(windowPositions, (position, key) =>
      applyDiff(position, positionDiff[key])
    );

    dispatch(updateWindowPositions(newPositions, false));
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
  positions: WindowPositions,
  center: boolean
): Dispatchable {
  return { type: UPDATE_WINDOW_POSITIONS, positions, center };
}

export function windowsHaveBeenCentered(): Dispatchable {
  return { type: WINDOWS_HAVE_BEEN_CENTERED };
}

export function centerWindowsIfNeeded(container: HTMLElement): Dispatchable {
  return (dispatch, getState) => {
    const state = getState();
    const { centerRequested } = state.windows;
    if (!centerRequested) {
      return;
    }
    const genWindows = Selectors.getGenWindows(state);
    const windowsInfo = Selectors.getWindowsInfo(state);
    const getOpen = Selectors.getWindowOpen(state);
    const getPixelSize = Selectors.getWindowPixelSize(state);
    const rect = container.getBoundingClientRect();

    const offsetLeft = rect.left + window.scrollX;
    const offsetTop = rect.top + window.scrollY;
    const width = container.scrollWidth;
    const height = container.scrollHeight;

    if (windowsInfo.some(w => w.x == null || w.y == null)) {
      // Some windows do not have an initial position, so we'll come up
      // with your own layout.
      const windowPositions: WindowPositions = {};
      const keys: string[] = Object.keys(genWindows).filter(
        windowId => genWindows[windowId].open
      );
      const totalHeight = keys.reduce((height, key) => {
        return height + getPixelSize(key).height;
      }, 0);
      const globalOffsetLeft = Math.max(0, width / 2 - WINDOW_WIDTH / 2);
      const globalOffsetTop = Math.max(0, height / 2 - totalHeight / 2);
      let offset = 0;
      keys.forEach(key => {
        windowPositions[key] = {
          x: Math.ceil(offsetLeft + globalOffsetLeft),
          y: Math.ceil(offsetTop + (globalOffsetTop + offset))
        };
        offset += getPixelSize(key).height;
      });
      dispatch(updateWindowPositions(windowPositions, false));
    } else {
      // A layout has been suplied. We will compute the bounding box and
      // center the given layout.
      const bounding = calculateBoundingBox(
        windowsInfo.filter(w => getOpen(w.key))
      );

      const boxHeight = bounding.bottom - bounding.top;
      const boxWidth = bounding.right - bounding.left;

      const move = {
        x: Math.ceil(offsetLeft - bounding.left + (width - boxWidth) / 2),
        y: Math.ceil(offsetTop - bounding.top + (height - boxHeight) / 2)
      };

      const newPositions = windowsInfo.reduce(
        (pos, w) => ({
          ...pos,
          [w.key]: { x: move.x + w.x, y: move.y + w.y }
        }),
        {}
      );

      dispatch(updateWindowPositions(newPositions, false));
    }
    dispatch(windowsHaveBeenCentered());
  };
}

export function browserWindowSizeChanged() {
  const { height, width } = Utils.getWindowSize();
  return { type: BROWSER_WINDOW_SIZE_CHANGED, height, width };
}

export function ensureWindowsAreOnScreen(): Dispatchable {
  return (dispatch, getState) => {
    const state = getState();

    const windowsInfo = Selectors.getWindowsInfo(state);
    const getOpen = Selectors.getWindowOpen(state);
    const { height, width } = Utils.getWindowSize();
    const bounding = calculateBoundingBox(
      windowsInfo.filter(w => getOpen(w.key))
    );
    const positions = Selectors.getWindowPositions(state);

    // Are we good?
    if (
      bounding.left >= 0 &&
      bounding.top >= 0 &&
      bounding.right <= width &&
      bounding.bottom <= height
    ) {
      // My work here is done.
      return;
    }

    const boundingHeight = bounding.bottom - bounding.top;
    const boundingWidth = bounding.right - bounding.left;

    // Could we simply shift all the windows by a constant offset?
    if (boundingWidth <= width && boundingHeight <= height) {
      let moveY = 0;
      let moveX = 0;
      if (bounding.top <= 0) {
        moveY = bounding.top;
      } else if (bounding.bottom > height) {
        moveY = bounding.bottom - height;
      }

      if (bounding.left <= 0) {
        moveX = bounding.left;
      } else if (bounding.right > width) {
        moveX = bounding.right - width;
      }

      const newPositions = Utils.objectMap(positions, position => ({
        x: position.x - moveX,
        y: position.y - moveY
      }));

      dispatch(updateWindowPositions(newPositions, false));
      return;
    }

    // TODO: Try moving the individual groups to try to fit them in

    // I give up. Just reset everything.
    dispatch(resetWindowLayout());
  };
}
