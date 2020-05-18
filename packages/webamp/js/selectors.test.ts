import reducer from "./reducers";
import { getEqfData, getNextTrackId } from "./selectors";
import { AppState } from "./types";
describe("getEqfData", () => {
  it("can extract EQF data from the current state", () => {
    const state = reducer(undefined, { type: "@@init" });
    const actual = getEqfData(state);
    const expected = {
      presets: [
        {
          hz60: 33,
          hz170: 33,
          hz310: 33,
          hz600: 33,
          hz1000: 33,
          hz3000: 33,
          hz12000: 33,
          hz14000: 33,
          hz16000: 33,
          hz6000: 33,
          name: "Entry1",
          preamp: 33,
        },
      ],
      type: "Winamp EQ library file v1.1",
    };
    expect(actual).toEqual(expected);
  });
});

describe("nextTrack", () => {
  it("returns null if you don't have any tracks", () => {
    const state: AppState = {
      playlist: { currentTrack: null, trackOrder: [] },
      media: { repeat: false },
    } as any;
    expect(state.playlist.trackOrder).toEqual([]);
    expect(getNextTrackId(state)).toBe(null);
  });

  it("returns null if you are going forward from the last track and repeat is not turned on", () => {
    const state: AppState = {
      playlist: { currentTrack: 3, trackOrder: [1, 2, 3] },
      media: { repeat: false },
    } as any;
    expect(getNextTrackId(state)).toBe(null);
  });

  it("wraps around if you are going forward from the last track and repeat _is_ turned on", () => {
    const state: AppState = {
      playlist: { currentTrack: 3, trackOrder: [1, 2, 3] },
      media: { repeat: true },
    } as any;
    expect(getNextTrackId(state)).toBe(1);
  });

  it("returns null if you are going backward from the first track and repeat is not turned on", () => {
    const state: AppState = {
      playlist: { currentTrack: 1, trackOrder: [1, 2, 3] },
      media: { repeat: false },
    } as any;
    expect(getNextTrackId(state, -1)).toBe(null);
  });

  it("wraps around if you are going backwards from the first track and repeat _is_ turned on", () => {
    const state: AppState = {
      playlist: { currentTrack: 1, trackOrder: [1, 2, 3] },
      media: { repeat: true },
    } as any;
    expect(getNextTrackId(state, -1)).toBe(3);
  });

  it("does a normal next", () => {
    const state: AppState = {
      playlist: { currentTrack: 2, trackOrder: [1, 2, 3] },
      media: { repeat: false },
    } as any;
    expect(getNextTrackId(state)).toBe(3);
  });

  it("does a normal previous", () => {
    const state: AppState = {
      playlist: { currentTrack: 2, trackOrder: [1, 2, 3] },
      media: { repeat: false },
    } as any;
    expect(getNextTrackId(state, -1)).toBe(1);
  });

  it("takes you to the last track if you overshoot", () => {
    const state: AppState = {
      playlist: { currentTrack: 2, trackOrder: [1, 2, 3] },
      media: { repeat: false },
    } as any;
    expect(getNextTrackId(state, 10)).toBe(3);
  });

  it("takes you to the first track if you overshoot", () => {
    const state: AppState = {
      playlist: { currentTrack: 2, trackOrder: [1, 2, 3] },
      media: { repeat: false },
    } as any;
    expect(getNextTrackId(state, -10)).toBe(1);
  });
});
