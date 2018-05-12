import { WINDOWS } from "../constants";
import {
  SET_FOCUSED_WINDOW,
  TOGGLE_WINDOW,
  CLOSE_WINDOW,
  ADD_GEN_WINDOW,
  UPDATE_WINDOW_POSITIONS,
  WINDOW_SIZE_CHANGED
} from "../actionTypes";

const defaultWindowsState = {
  focused: WINDOWS.MAIN,
  genWindows: {
    // TODO: Remove static capabilites and derive them from ids/generic
    main: {
      size: [0, 0],
      open: true,
      shade: false,
      canResize: false,
      canShade: true,
      canDouble: true,
      generic: false
    },
    equalizer: {
      size: [0, 0],
      open: true,
      shade: false,
      canResize: false,
      canShade: true,
      canDouble: true,
      generic: false
    },
    playlist: {
      size: [0, 0],
      open: true,
      shade: false,
      canResize: true,
      canShade: true,
      canDouble: false,
      generic: false
    }
  },
  positions: {}
};

const windows = (state = defaultWindowsState, action) => {
  switch (action.type) {
    case SET_FOCUSED_WINDOW:
      return { ...state, focused: action.window };
    case TOGGLE_WINDOW:
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            ...state.genWindows[action.windowId],
            open: !state.genWindows[action.windowId].open
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
    case ADD_GEN_WINDOW:
      return {
        ...state,
        genWindows: {
          ...state.genWindows,
          [action.windowId]: {
            title: action.title,
            open: true,
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
