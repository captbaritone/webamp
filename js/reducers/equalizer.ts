import { Slider, Action } from "./../types";

import { BANDS } from "../constants";
import {
  SET_BAND_VALUE,
  SET_EQ_AUTO,
  SET_EQ_ON,
  SET_EQ_OFF
} from "../actionTypes";

export interface EqualizerState {
  on: boolean;
  auto: boolean;
  sliders: Record<Slider, number>;
}

const defaultState = {
  on: true,
  auto: false,
  sliders: {
    preamp: 50,
    60: 50,
    170: 50,
    310: 50,
    600: 50,
    1000: 50,
    3000: 50,
    6000: 50,
    12000: 50,
    14000: 50,
    16000: 50
  }
};

const equalizer = (
  state: EqualizerState = defaultState,
  action: Action
): EqualizerState => {
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

export default equalizer;
