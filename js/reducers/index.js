import { combineReducers } from "redux";
import { BANDS } from "../constants";
import {
  SET_BAND_VALUE,
  SET_EQ_AUTO,
  SET_EQ_ON,
  SET_EQ_OFF,
  SET_AVAILABLE_SKINS,
  NETWORK_CONNECTED,
  NETWORK_DISCONNECTED
} from "../actionTypes";

import playlist from "./playlist";
import windows from "./windows";
import media from "./media";
import display from "./display";
import userInput from "./userInput";

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

const equalizer = (state, action) => {
  if (!state) {
    state = {
      on: true,
      auto: false,
      sliders: {
        preamp: 50
      }
    };
    BANDS.forEach(band => {
      state.sliders[band] = 50;
    });
    return state;
  }
  switch (action.type) {
    case SET_BAND_VALUE:
      const newSliders = { ...state.sliders, [action.band]: action.value };
      return { ...state, sliders: newSliders };
    case SET_EQ_ON:
      return { ...state, on: true };
    case SET_EQ_OFF:
      return { ...state, on: false };
    case SET_EQ_AUTO:
      return { ...state, auto: action.value };
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
