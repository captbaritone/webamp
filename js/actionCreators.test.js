import { BANDS } from "./constants";
import {
  STOP,
  SET_VOLUME,
  SET_BALANCE,
  TOGGLE_REPEAT,
  TOGGLE_SHUFFLE,
  SET_BAND_VALUE
} from "./actionTypes";

import {
  stop,
  setVolume,
  setBalance,
  toggleRepeat,
  toggleShuffle,
  setPreamp,
  setEqBand,
  setEqToMax,
  setEqToMin,
  setEqToMid
} from "./actionCreators";

test("stop", () => {
  const expectedAction = { type: STOP };
  expect(stop()).toEqual(expectedAction);
});

describe("setVolume", () => {
  it("enforces a mimimum value", () => {
    const expectedAction = {
      type: SET_VOLUME,
      volume: 0
    };
    expect(setVolume(-10)).toEqual(expectedAction);
  });
  it("enforces a maximum value", () => {
    const expectedAction = {
      type: SET_VOLUME,
      volume: 100
    };
    expect(setVolume(110)).toEqual(expectedAction);
  });
});

describe("setBalance", () => {
  it("enforces a mimimum value", () => {
    const expectedAction = {
      type: SET_BALANCE,
      balance: -100
    };
    expect(setBalance(-110)).toEqual(expectedAction);
  });
  it("enforces a maximum value", () => {
    const expectedAction = {
      type: SET_BALANCE,
      balance: 100
    };
    expect(setBalance(110)).toEqual(expectedAction);
  });
  it("snaps to zero for positive values close to zero", () => {
    const expectedAction = {
      type: SET_BALANCE,
      balance: 0
    };
    expect(setBalance(24)).toEqual(expectedAction);
  });
  it("snaps to zero for negative values close to zero", () => {
    const expectedAction = {
      type: SET_BALANCE,
      balance: 0
    };
    expect(setBalance(-24)).toEqual(expectedAction);
  });
});

test("toggleRepeat", () => {
  const expectedAction = { type: TOGGLE_REPEAT };
  expect(toggleRepeat()).toEqual(expectedAction);
});

test("toggleShuffle", () => {
  const expectedAction = { type: TOGGLE_SHUFFLE };
  expect(toggleShuffle()).toEqual(expectedAction);
});

test("setPreamp", () => {
  const expectedAction = { type: SET_BAND_VALUE, band: "preamp", value: 100 };
  expect(setPreamp(100)).toEqual(expectedAction);
});

test("setEqBand", () => {
  const expectedAction = { type: SET_BAND_VALUE, band: 3, value: 100 };
  expect(setEqBand(3, 100)).toEqual(expectedAction);
});

test("setEqToMax", () => {
  const mockDispatch = jest.fn();
  const dispatcher = setEqToMax();
  dispatcher(mockDispatch);
  const expectedCalls = BANDS.map(band => [
    { type: SET_BAND_VALUE, band, value: 100 }
  ]);
  expect(mockDispatch.mock.calls).toEqual(expectedCalls);
});

test("setEqToMin", () => {
  const mockDispatch = jest.fn();
  const dispatcher = setEqToMin();
  dispatcher(mockDispatch);
  const expectedCalls = BANDS.map(band => [
    { type: SET_BAND_VALUE, band, value: 0 }
  ]);
  expect(mockDispatch.mock.calls).toEqual(expectedCalls);
});

test("setEqToMid", () => {
  const mockDispatch = jest.fn();
  const dispatcher = setEqToMid();
  dispatcher(mockDispatch);
  const expectedCalls = BANDS.map(band => [
    { type: SET_BAND_VALUE, band, value: 50 }
  ]);
  expect(mockDispatch.mock.calls).toEqual(expectedCalls);
});
