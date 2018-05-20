import { BANDS } from "../constants";

import { SET_EQ_ON, SET_EQ_OFF, SET_BAND_VALUE } from "../actionTypes";

const BAND_SNAP_DISTANCE = 10;
const BAND_MID_POINT_VALUE = 50;
export function setEqBand(band, value) {
  if (
    value < BAND_MID_POINT_VALUE + BAND_SNAP_DISTANCE &&
    value > BAND_MID_POINT_VALUE - BAND_SNAP_DISTANCE
  ) {
    return { type: SET_BAND_VALUE, band, value: BAND_MID_POINT_VALUE };
  }
  return { type: SET_BAND_VALUE, band, value };
}

function _setEqTo(value) {
  return dispatch => {
    Object.keys(BANDS).forEach(key => {
      dispatch({
        type: SET_BAND_VALUE,
        value,
        band: BANDS[key]
      });
    });
  };
}

export function setEqToMax() {
  return _setEqTo(100);
}

export function setEqToMid() {
  return _setEqTo(50);
}

export function setEqToMin() {
  return _setEqTo(0);
}

export function setPreamp(value) {
  return { type: SET_BAND_VALUE, band: "preamp", value };
}

export function toggleEq() {
  return (dispatch, getState) => {
    const type = getState().equalizer.on ? SET_EQ_OFF : SET_EQ_ON;
    dispatch({ type });
  };
}
