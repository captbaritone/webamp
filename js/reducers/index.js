import { combineReducers } from "redux";
import {
  SET_AVAILABLE_SKINS,
  NETWORK_CONNECTED,
  NETWORK_DISCONNECTED
} from "../actionTypes";

import playlist from "./playlist";
import windows from "./windows";
import media from "./media";
import display from "./display";
import userInput from "./userInput";
import equalizer from "./equalizer";

const defaultSettingsState = {
  availableSkins: []
};

const settings = (state = defaultSettingsState, action) => {
  switch (action.type) {
    case SET_AVAILABLE_SKINS:
      return { ...state, availableSkins: action.skins };
    default:
      return state;
  }
};

const network = (state = { connected: true }, action) => {
  switch (action.type) {
    case NETWORK_CONNECTED:
      return { ...state, connected: true };
    case NETWORK_DISCONNECTED:
      return { ...state, connected: false };
    default:
      return state;
  }
};

const reducer = combineReducers({
  userInput,
  windows,
  display,
  settings,
  equalizer,
  playlist,
  media,
  network
});

export default reducer;
