import { WINDOWS } from "../constants";
import {
  SET_FOCUSED_WINDOW,
  TOGGLE_EQUALIZER_WINDOW,
  CLOSE_EQUALIZER_WINDOW,
  TOGGLE_PLAYLIST_WINDOW,
  CLOSE_GEN_WINDOW,
  OPEN_GEN_WINDOW
} from "../actionTypes";

import { arrayWith, arrayWithout } from "../utils";

const defaultWindowsState = {
  focused: WINDOWS.MAIN,
  equalizer: true,
  playlist: true,
  // openGenWindows: ["AVS_WINDOW"]
  openGenWindows: []
};

const windows = (state = defaultWindowsState, action) => {
  switch (action.type) {
    case SET_FOCUSED_WINDOW:
      return { ...state, focused: action.window };
    case TOGGLE_EQUALIZER_WINDOW:
      return { ...state, equalizer: !state.equalizer };
    case CLOSE_EQUALIZER_WINDOW:
      return { ...state, equalizer: false };
    case TOGGLE_PLAYLIST_WINDOW:
      return { ...state, playlist: !state.playlist };
    case CLOSE_GEN_WINDOW:
      return {
        ...state,
        openGenWindows: arrayWithout(state.openGenWindow, action.windowId)
      };
    case OPEN_GEN_WINDOW:
      return {
        ...state,
        openGenWindows: arrayWith(state.openGenWindow, action.windowId)
      };
    default:
      return state;
  }
};

export default windows;
