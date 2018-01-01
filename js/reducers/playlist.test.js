import {
  SHIFT_CLICKED_TRACK,
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK
} from "../actionTypes";
import reducer from "./playlist";

describe("playlist reducer", () => {
  it("can handle clicking a track", () => {
    const initialState = {
      tracks: {
        2: { selected: false },
        3: { selected: false }
      },
      trackOrder: [3, 2],
      lastSelectedIndex: 0
    };

    const nextState = reducer(initialState, {
      type: CLICKED_TRACK,
      index: 1
    });
    expect(nextState).toEqual({
      tracks: {
        2: { selected: true },
        3: { selected: false }
      },
      trackOrder: [3, 2],
      lastSelectedIndex: 1
    });
  });
  it("can handle ctrl-clicking a track", () => {
    const initialState = {
      tracks: {
        2: { selected: true },
        3: { selected: false }
      },
      trackOrder: [3, 2],
      lastSelectedIndex: 1
    };

    const nextState = reducer(initialState, {
      type: CTRL_CLICKED_TRACK,
      index: 0
    });
    expect(nextState).toEqual({
      tracks: {
        2: { selected: true },
        3: { selected: true }
      },
      trackOrder: [3, 2],
      lastSelectedIndex: 0
    });
  });
  it("can handle shift-click", () => {
    const initialState = {
      tracks: {
        0: { selected: false },
        1: { selected: false },
        2: { selected: false },
        3: { selected: false }
      },
      trackOrder: [3, 2, 1, 0],
      lastSelectedIndex: 1
    };

    const nextState = reducer(initialState, {
      type: SHIFT_CLICKED_TRACK,
      index: 3
    });
    expect(nextState).toEqual({
      lastSelectedIndex: 1,
      tracks: {
        0: { selected: true },
        1: { selected: true },
        2: { selected: true },
        3: { selected: false }
      },
      trackOrder: [3, 2, 1, 0]
    });
  });
});
