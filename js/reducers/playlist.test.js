import {
  SHIFT_CLICKED_TRACK,
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK,
  ADD_TRACK_FROM_URL
} from "../actionTypes";
import reducer from "./playlist";

describe("playlist reducer", () => {
  it("can handle adding a track", () => {
    const initialState = {
      tracks: {},
      trackOrder: [],
      lastSelectedIndex: null
    };
    const nextState = reducer(initialState, {
      type: ADD_TRACK_FROM_URL,
      id: 100,
      name: "My Track Name",
      url: "url://some-url"
    });
    expect(nextState).toEqual({
      tracks: {
        100: {
          selected: false,
          duration: null,
          title: "My Track Name",
          url: "url://some-url"
        }
      },
      trackOrder: [100],
      lastSelectedIndex: null
    });
  });
  it("defaults to adding new tracks to the end of the list", () => {
    const initialState = {
      tracks: {
        2: { selected: false },
        3: { selected: false }
      },
      trackOrder: [3, 2],
      lastSelectedIndex: 0
    };
    const nextState = reducer(initialState, {
      type: ADD_TRACK_FROM_URL,
      id: 100,
      name: "My Track Name",
      url: "url://some-url"
    });
    expect(nextState).toEqual({
      tracks: {
        2: { selected: false },
        3: { selected: false },
        100: {
          selected: false,
          duration: null,
          title: "My Track Name",
          url: "url://some-url"
        }
      },
      trackOrder: [3, 2, 100],
      lastSelectedIndex: null
    });
  });
  it("can handle adding a track at a given index", () => {
    const initialState = {
      tracks: {
        2: { selected: false },
        3: { selected: false }
      },
      trackOrder: [3, 2],
      lastSelectedIndex: 0
    };
    const nextState = reducer(initialState, {
      type: ADD_TRACK_FROM_URL,
      id: 100,
      name: "My Track Name",
      url: "url://some-url",
      atIndex: 1
    });
    expect(nextState).toEqual({
      tracks: {
        2: { selected: false },
        3: { selected: false },
        100: {
          selected: false,
          duration: null,
          title: "My Track Name",
          url: "url://some-url"
        }
      },
      trackOrder: [3, 100, 2],
      lastSelectedIndex: null
    });
  });
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
