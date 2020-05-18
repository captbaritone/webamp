import {
  SHIFT_CLICKED_TRACK,
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK,
  ADD_TRACK_FROM_URL,
} from "../actionTypes";
import reducer from "./playlist";

describe("playlist reducer", () => {
  it("can handle adding a track", () => {
    const initialState = {
      trackOrder: [],
      selectedTracks: new Set(),
      lastSelectedIndex: null,
    };
    const nextState = reducer(initialState, {
      type: ADD_TRACK_FROM_URL,
      id: 100,
      defaultName: "My Track Name",
      url: "url://some-url",
    });
    expect(nextState).toEqual({
      trackOrder: [100],
      selectedTracks: new Set(),
      lastSelectedIndex: null,
    });
  });
  it("defaults to adding new tracks to the end of the list", () => {
    const initialState = {
      trackOrder: [3, 2],
      selectedTracks: new Set(),
      lastSelectedIndex: 0,
    };
    const nextState = reducer(initialState, {
      type: ADD_TRACK_FROM_URL,
      id: 100,
      defaultName: "My Track Name",
      url: "url://some-url",
    });
    expect(nextState).toEqual({
      selectedTracks: new Set(),
      trackOrder: [3, 2, 100],
      lastSelectedIndex: null,
    });
  });
  it("can handle adding a track at a given index", () => {
    const initialState = {
      selectedTracks: new Set(),
      trackOrder: [3, 2],
      lastSelectedIndex: 0,
    };
    const nextState = reducer(initialState, {
      type: ADD_TRACK_FROM_URL,
      id: 100,
      defaultName: "My Track Name",
      url: "url://some-url",
      atIndex: 1,
    });
    expect(nextState).toEqual({
      selectedTracks: new Set(),
      trackOrder: [3, 100, 2],
      lastSelectedIndex: null,
    });
  });
  it("can handle clicking a track", () => {
    const initialState = {
      trackOrder: [3, 2],
      selectedTracks: new Set(),
      lastSelectedIndex: 0,
    };

    const nextState = reducer(initialState, {
      type: CLICKED_TRACK,
      index: 1,
    });
    expect(nextState).toEqual({
      selectedTracks: new Set([2]),
      trackOrder: [3, 2],
      lastSelectedIndex: 1,
    });
  });
  it("can handle ctrl-clicking a track", () => {
    const initialState = {
      selectedTracks: new Set([2]),
      trackOrder: [3, 2],
      lastSelectedIndex: 1,
    };

    const nextState = reducer(initialState, {
      type: CTRL_CLICKED_TRACK,
      index: 0,
    });
    expect(nextState).toEqual({
      selectedTracks: new Set([2, 3]),
      trackOrder: [3, 2],
      lastSelectedIndex: 0,
    });
  });
  it("can handle shift-click", () => {
    const initialState = {
      selectedTracks: new Set(),
      trackOrder: [3, 2, 1, 0],
      lastSelectedIndex: 1,
    };

    const nextState = reducer(initialState, {
      type: SHIFT_CLICKED_TRACK,
      index: 3,
    });
    expect(nextState).toEqual({
      lastSelectedIndex: 1,
      selectedTracks: new Set([0, 1, 2]),
      trackOrder: [3, 2, 1, 0],
    });
  });
});
