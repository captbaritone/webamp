import { Action, WindowId, Box, Point } from "../types";
import { WINDOWS } from "../constants";
import {
  SET_FOCUSED_WINDOW,
  TOGGLE_WINDOW,
  CLOSE_WINDOW,
  UPDATE_WINDOW_POSITIONS,
  WINDOW_SIZE_CHANGED,
  TOGGLE_WINDOW_SHADE_MODE,
  LOAD_SERIALIZED_STATE,
  BROWSER_WINDOW_SIZE_CHANGED,
  RESET_WINDOW_SIZES,
  ENABLE_MILKDROP,
} from "../actionTypes";
import * as Utils from "../utils";
import { WindowsSerializedStateV1 } from "../serializedStates/v1Types";

export type WindowPosition = Point;

export type WindowPositions = {
  [windowId: string]: WindowPosition;
};

export interface WebampWindow {
  title: string;
  size: [number, number];
  open: boolean;
  shade?: boolean;
  canResize: boolean;
  canShade: boolean;
  canDouble: boolean;
  hotkey?: string;
  position: WindowPosition;
}

export interface WindowInfo extends Box {
  key: WindowId;
}
export interface WindowsState {
  focused: WindowId | null;
  genWindows: { [name: string]: WebampWindow };
  browserWindowSize: { height: number; width: number };
  positionsAreRelative: boolean;
  windowOrder: WindowId[];
}

const defaultWindowsState: WindowsState = {
  focused: WINDOWS.MAIN,
  positionsAreRelative: true,
  genWindows: {
    // TODO: Remove static capabilites and derive them from ids/generic
    [WINDOWS.MAIN]: {
      title: "Main Window",
      size: [0, 0],
      open: true,
      shade: false,
      canResize: false,
      canShade: true,
      canDouble: true,
      hotkey: "Alt+W",
      position: { x: 0, y: 0 },
    },
    [WINDOWS.EQUALIZER]: {
      title: "Equalizer",
      size: [0, 0],
      open: true,
      shade: false,
      canResize: false,
      canShade: true,
      canDouble: true,
      hotkey: "Alt+G",
      position: { x: 0, y: 0 },
    },
    [WINDOWS.PLAYLIST]: {
      title: "Playlist Editor",
      size: [0, 0],
      open: true,
      shade: false,
      canResize: true,
      canShade: true,
      canDouble: false,
      hotkey: "Alt+E",
      position: { x: 0, y: 0 },
    },
  },
  browserWindowSize: { width: 0, height: 0 },
  windowOrder: [
    WINDOWS.PLAYLIST,
    WINDOWS.EQUALIZER,
    WINDOWS.MILKDROP,
    WINDOWS.MAIN,
  ],
};

const windows = (
  state: WindowsState = defaultWindowsState,
  action: Action
): WindowsState => {
  switch (action.type) {
    case ENABLE_MILKDROP:
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [WINDOWS.MILKDROP]: {
            title: "Milkdrop",
            size: [0, 0],
            open: action.open,
            shade: false,
            canResize: true,
            canShade: false,
            canDouble: false,
            position: { x: 0, y: 0 },
          },
        },
      };
    case SET_FOCUSED_WINDOW:
      let windowOrder = state.windowOrder;
      if (action.window != null) {
        windowOrder = [
          ...state.windowOrder.filter((windowId) => windowId !== action.window),
          action.window,
        ];
      }
      return { ...state, focused: action.window, windowOrder };
    case TOGGLE_WINDOW_SHADE_MODE:
      const { canShade } = state.genWindows[action.windowId];
      if (!canShade) {
        throw new Error(
          `Tried to shade/unshade a window that cannot be shaded: ${action.windowId}`
        );
      }
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            ...state.genWindows[action.windowId],
            shade: !state.genWindows[action.windowId].shade,
          },
        },
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
          },
        },
      };
    case CLOSE_WINDOW:
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            ...state.genWindows[action.windowId],
            open: false,
          },
        },
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
            size: action.size,
          },
        },
      };
    case UPDATE_WINDOW_POSITIONS:
      return {
        ...state,
        positionsAreRelative:
          action.absolute === true ? false : state.positionsAreRelative,
        genWindows: Utils.objectMap(state.genWindows, (w, windowId) => {
          const newPosition = action.positions[windowId];
          if (newPosition == null) {
            return w;
          }
          return { ...w, position: newPosition };
        }),
      };
    case RESET_WINDOW_SIZES:
      return {
        ...state,
        genWindows: Utils.objectMap(state.genWindows, (w) => ({
          ...w,
          // Not sure why TypeScript can't figure this out for itself.
          size: [0, 0] as [number, number],
        })),
      };
    case LOAD_SERIALIZED_STATE: {
      const { genWindows, focused, positionsAreRelative } =
        action.serializedState.windows;
      return {
        ...state,
        positionsAreRelative,
        genWindows: Utils.objectMap(state.genWindows, (w, windowId) => {
          const serializedW = genWindows[windowId];
          if (serializedW == null) {
            return w;
          }
          // Pull out `hidden` since it's been removed from our state.
          const { hidden, ...rest } = serializedW;
          return { ...w, ...rest };
        }),
        focused,
      };
    }
    case BROWSER_WINDOW_SIZE_CHANGED:
      return {
        ...state,
        browserWindowSize: { height: action.height, width: action.width },
      };

    default:
      return state;
  }
};

export function getSerializedState(
  state: WindowsState
): WindowsSerializedStateV1 {
  return {
    positionsAreRelative: state.positionsAreRelative,
    genWindows: Utils.objectMap(state.genWindows, (w) => {
      return {
        size: w.size,
        open: w.open,
        hidden: false, // Not used any more
        shade: w.shade || false,
        position: w.position,
      };
    }),
    focused: state.focused,
  };
}

export default windows;
