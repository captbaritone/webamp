import { BANDS } from "../constants";

import {
  SET_EQ_ON,
  SET_EQ_OFF,
  SET_BAND_VALUE,
  SET_EQ_AUTO,
} from "../actionTypes";
import { Band, Thunk, Action } from "../types";

const BAND_SNAP_DISTANCE = 5;
const BAND_MID_POINT_VALUE = 50;

function _snapBandValue(value: number): number {
  if (
    value < BAND_MID_POINT_VALUE + BAND_SNAP_DISTANCE &&
    value > BAND_MID_POINT_VALUE - BAND_SNAP_DISTANCE
  ) {
    return BAND_MID_POINT_VALUE;
  }
  return value;
}

export function setEqBand(band: Band, value: number): Action {
  return { type: SET_BAND_VALUE, band, value: _snapBandValue(value) };
}

function _setEqTo(value: number): Thunk {
  return (dispatch) => {
    Object.values(BANDS).forEach((band) => {
      dispatch({
        type: SET_BAND_VALUE,
        value,
        band: band,
      });
    });
  };
}

export function setEqToMax(): Thunk {
  return _setEqTo(100);
}

export function setEqToMid(): Thunk {
  return _setEqTo(50);
}

export function setEqToMin(): Thunk {
  return _setEqTo(0);
}

export function setPreamp(value: number): Action {
  return { type: SET_BAND_VALUE, band: "preamp", value: _snapBandValue(value) };
}

export function toggleEq(): Thunk {
  return (dispatch, getState) => {
    if (getState().equalizer.on) {
      dispatch({ type: SET_EQ_OFF });
    } else {
      dispatch({ type: SET_EQ_ON });
    }
  };
}

export function toggleEqAuto(): Thunk {
  return (dispatch) => {
    // We don't actually support this feature yet so don't let the user ever turn it on.
    // dispatch({ type: SET_EQ_AUTO, value: !getState().equalizer.auto });
    dispatch({ type: SET_EQ_AUTO, value: false });
  };
}
