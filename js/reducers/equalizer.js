import { BANDS } from "../constants";
import {
  SET_BAND_VALUE,
  SET_EQ_AUTO,
  SET_EQ_ON,
  SET_EQ_OFF
} from "../actionTypes";

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

export default equalizer;
