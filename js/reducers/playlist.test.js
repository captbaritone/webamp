import {
  SHIFT_CLICKED_TRACK,
  CLICKED_TRACK,
  CTRL_CLICKED_TRACK,
  ADD_TRACK_FROM_URL
} from "../actionTypes";
import reducer, { getTrackDisplayName } from "./playlist";

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
      defaultName: "My Track Name",
      url: "url://some-url"
    });
    expect(nextState).toEqual({
      tracks: {
        100: {
          id: 100,
          selected: false,
          duration: null,
          defaultName: "My Track Name",
          mediaTagsRequestStatus: "NOT_REQUESTED",
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
        2: { id: 2, selected: false },
        3: { id: 3, selected: false }
      },
      trackOrder: [3, 2],
      lastSelectedIndex: 0
    };
    const nextState = reducer(initialState, {
      type: ADD_TRACK_FROM_URL,
      id: 100,
      defaultName: "My Track Name",
      url: "url://some-url"
    });
    expect(nextState).toEqual({
      tracks: {
        2: { id: 2, selected: false },
        3: { id: 3, selected: false },
        100: {
          id: 100,
          selected: false,
          duration: null,
          mediaTagsRequestStatus: "NOT_REQUESTED",
          defaultName: "My Track Name",
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
        2: { id: 2, selected: false },
        3: { id: 3, selected: false }
      },
      trackOrder: [3, 2],
      lastSelectedIndex: 0
    };
    const nextState = reducer(initialState, {
      type: ADD_TRACK_FROM_URL,
      id: 100,
      defaultName: "My Track Name",
      url: "url://some-url",
      atIndex: 1
    });
    expect(nextState).toEqual({
      tracks: {
        2: { id: 2, selected: false },
        3: { id: 3, selected: false },
        100: {
          id: 100,
          selected: false,
          duration: null,
          mediaTagsRequestStatus: "NOT_REQUESTED",
          defaultName: "My Track Name",
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

describe("getTrackDisplayName", () => {
  const expectDisplayName = (track, expected) => {
    expect(getTrackDisplayName({ tracks: { "1": track } }, "1")).toBe(expected);
  };
  it("uses the artists and title if provided", () => {
    expectDisplayName(
      {
        artist: "Artist",
        title: "Title",
        defaultName: "Default Name",
        url: "https://example.com/dir/filename.mp3"
      },
      "Artist - Title"
    );
  });
  it("uses the title if provided", () => {
    expectDisplayName(
      {
        title: "Title",
        defaultName: "Default Name",
        url: "https://example.com/dir/filename.mp3"
      },
      "Title"
    );
  });
  it("uses a defaultName if provided", () => {
    expectDisplayName(
      {
        defaultName: "Default Name",
        url: "https://example.com/dir/filename.mp3"
      },
      "Default Name"
    );
  });
  it("uses the filename if a URL is provided", () => {
    expectDisplayName(
      { url: "https://example.com/dir/filename.mp3" },
      "filename.mp3"
    );
  });
  it("does not use the filename if a blob URL is provided", () => {
    expectDisplayName({ url: "blob:foo" }, "???");
  });
  it("falls back to '???'", () => {
    expectDisplayName({}, "???");
  });
});
