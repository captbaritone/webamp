import { combineReducers } from "redux";
import { BANDS } from "../constants";
import {
  SET_BAND_VALUE,
  SET_FOCUS,
  SET_BAND_FOCUS,
  SET_SCRUB_POSITION,
  SET_EQ_AUTO,
  SET_EQ_ON,
  SET_EQ_OFF,
  UNSET_FOCUS,
  SET_USER_MESSAGE,
  UNSET_USER_MESSAGE,
  SET_AVAILABLE_SKINS,
  NETWORK_CONNECTED,
  NETWORK_DISCONNECTED
} from "../actionTypes";

import playlist from "./playlist";
import windows from "./windows";
import media from "./media";
import display from "./display";

const defaultUserInput = {
  focus: null,
  bandFocused: null,
  scrubPosition: 0,
  userMessage: null
};

export const userInput = (state = defaultUserInput, action) => {
  switch (action.type) {
    case SET_FOCUS:
      return { ...state, focus: action.input, bandFocused: null };
    case SET_BAND_FOCUS:
      return { ...state, focus: action.input, bandFocused: action.bandFocused };
    case UNSET_FOCUS:
      return { ...state, focus: null, bandFocused: null };
    case SET_SCRUB_POSITION:
      return { ...state, scrubPosition: action.position };
    case SET_USER_MESSAGE:
      return { ...state, userMessage: action.message };
    case UNSET_USER_MESSAGE:
      return { ...state, userMessage: null };
    default:
      return state;
  }
};

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
