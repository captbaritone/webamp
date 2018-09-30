import { Action, WindowId } from "../types";
import { WINDOWS } from "../constants";
import {
  SET_FOCUSED_WINDOW,
  TOGGLE_WINDOW,
  CLOSE_WINDOW,
  SET_WINDOW_VISIBILITY,
  ADD_GEN_WINDOW,
  UPDATE_WINDOW_POSITIONS,
  WINDOW_SIZE_CHANGED,
  TOGGLE_WINDOW_SHADE_MODE,
  LOAD_SERIALIZED_STATE,
  BROWSER_WINDOW_SIZE_CHANGED,
  RESET_WINDOW_SIZES
} from "../actionTypes";
import * as Utils from "../utils";

export interface WindowPosition {
  x: number;
  y: number;
}

export type WindowPositions = {
  [windowId: string]: WindowPosition;
};

export interface WebampWindow {
  title: string;
  size: [number, number];
  open: boolean;
  hidden: boolean;
  shade?: boolean;
  canResize: boolean;
  canShade: boolean;
  canDouble: boolean;
  generic: boolean;
  hotkey?: string;
  position: WindowPosition;
}

export interface WindowInfo {
  key: WindowId;
  height: number;
  width: number;
  x: number;
  y: number;
}
export interface WindowsState {
  focused: string;
  genWindows: { [name: string]: WebampWindow };
  browserWindowSize: { height: number; width: number };
}

interface SerializedWindow {
  size: [number, number];
  open: boolean;
  hidden: boolean;
  shade: boolean;
  position: WindowPosition;
}

export interface WindowsSerializedStateV1 {
  genWindows: { [windowId: string]: SerializedWindow };
  focused: string;
}

const defaultWindowsState: WindowsState = {
  focused: WINDOWS.MAIN,
  genWindows: {
    // TODO: Remove static capabilites and derive them from ids/generic
    main: {
      title: "Main Window",
      size: [0, 0],
      open: true,
      hidden: false,
      shade: false,
      canResize: false,
      canShade: true,
      canDouble: true,
      generic: false,
      hotkey: "Alt+W",
      position: { x: 0, y: 0 }
    },
    equalizer: {
      title: "Equalizer",
      size: [0, 0],
      open: true,
      hidden: false,
      shade: false,
      canResize: false,
      canShade: true,
      canDouble: true,
      generic: false,
      hotkey: "Alt+G",
      position: { x: 0, y: 0 }
    },
    playlist: {
      title: "Playlist Editor",
      size: [0, 0],
      open: true,
      hidden: false,
      shade: false,
      canResize: true,
      canShade: true,
      canDouble: false,
      generic: false,
      hotkey: "Alt+E",
      position: { x: 0, y: 0 }
    }
  },
  browserWindowSize: { width: 0, height: 0 }
};

const windows = (
  state: WindowsState = defaultWindowsState,
  action: Action
): WindowsState => {
  switch (action.type) {
    case SET_FOCUSED_WINDOW:
      return { ...state, focused: action.window };
    case TOGGLE_WINDOW_SHADE_MODE:
      const { canShade } = state.genWindows[action.windowId];
      if (!canShade) {
        throw new Error(
          `Tried to shade/unshade a window that cannot be shaded: ${
            action.windowId
          }`
        );
      }
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            ...state.genWindows[action.windowId],
            shade: !state.genWindows[action.windowId].shade
          }
        }
      };
    case TOGGLE_WINDOW:
      const windowState = state.genWindows[action.windowId];
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            ...windowState,
            open: !windowState.open,
            // Reset hidden state when opening window
            hidden: windowState.open ? windowState.hidden : false
          }
        }
      };
    case CLOSE_WINDOW:
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            ...state.genWindows[action.windowId],
            open: false
          }
        }
      };
    case SET_WINDOW_VISIBILITY:
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            ...state.genWindows[action.windowId],
            hidden: action.hidden
          }
        }
      };
    case ADD_GEN_WINDOW:
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            title: action.title,
            open: action.open,
            hidden: false,
            size: [0, 0],
            canShade: false,
            canResize: true,
            canDouble: false,
            generic: true,
            position: { x: 0, y: 0 }
          }
        }
      };
    case WINDOW_SIZE_CHANGED:
      const { canResize } = state.genWindows[action.windowId];
      if (!canResize) {
        throw new Error(
          `Tried to resize a window that cannot be resized: ${action.windowId}`
        );
      }
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            ...state.genWindows[action.windowId],
            size: action.size
          }
        }
      };
    case UPDATE_WINDOW_POSITIONS:
      return {
        ...state,
        genWindows: Utils.objectMap(state.genWindows, (w, windowId) => {
          const newPosition = action.positions[windowId];
          if (newPosition == null) {
            return w;
          }
          return { ...w, position: newPosition };
        })
      };
    case RESET_WINDOW_SIZES:
      return {
        ...state,
        genWindows: Utils.objectMap(state.genWindows, w => ({
          ...w,
          // Not sure why TypeScript can't figure this out for itself.
          size: [0, 0] as [number, number]
        }))
      };
    case LOAD_SERIALIZED_STATE: {
      const { genWindows, focused } = action.serializedState.windows;
      return {
        ...state,
        genWindows: Utils.objectMap(state.genWindows, (w, windowId) => {
          const serializedW = genWindows[windowId];
          if (serializedW == null) {
            return w;
          }
          return { ...w, ...serializedW };
        }),
        focused
      };
    }
    case BROWSER_WINDOW_SIZE_CHANGED:
      return {
        ...state,
        browserWindowSize: { height: action.height, width: action.width }
      };

    default:
      return state;
  }
};

export function getSerializedState(
  state: WindowsState
): WindowsSerializedStateV1 {
  return {
    genWindows: Utils.objectMap(state.genWindows, w => {
      return {
        size: w.size,
        open: w.open,
        hidden: w.hidden,
        shade: w.shade || false,
        position: w.position
      };
    }),
    focused: state.focused
  };
}

export default windows;
