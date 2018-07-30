import { WINDOWS } from "../constants";
import {
  SET_FOCUSED_WINDOW,
  TOGGLE_WINDOW,
  CLOSE_WINDOW,
  SET_WINDOW_VISIBILITY,
  ADD_GEN_WINDOW,
  UPDATE_WINDOW_POSITIONS,
  WINDOW_SIZE_CHANGED,
  TOGGLE_WINDOW_SHADE_MODE
} from "../actionTypes";

const defaultWindowsState = {
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
      hotkey: "Alt+W"
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
      hotkey: "Alt+G"
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
      hotkey: "Alt+E"
    }
  },
  positions: {}
};

const windows = (state = defaultWindowsState, action) => {
  switch (action.type) {
    case SET_FOCUSED_WINDOW:
      return { ...state, focused: action.window };
    case TOGGLE_WINDOW_SHADE_MODE:
      const { canShade } = state.genWindows[action.windowId];
      if (!canShade) {
        throw new Error(
          "Tried to shade/unshade a window that cannot be shaded:",
          action.windowId
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
            generic: true
          }
        }
      };
    case WINDOW_SIZE_CHANGED:
      const { canResize } = state.genWindows[action.windowId];
      if (!canResize) {
        throw new Error(
          "Tried to resize a window that cannot be resized:",
          action.windowId
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
        positions: { ...state.positions, ...action.positions }
      };
    default:
      return state;
  }
};

export default windows;
