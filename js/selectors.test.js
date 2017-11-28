import reducer from "./reducers";
import { getEqfData, nextTrack } from "./selectors";
describe("getEqfData", () => {
  it("can extract EQF data from the current state", () => {
    const state = reducer(undefined, { type: "@@INIT" });
    //state = reducer(state, { type: "SET_BAND_VALUE", band: 60, value: 100 });
    const actual = getEqfData(state);
    const expected = {
      presets: [
        {
          hz60: 32,
          hz170: 32,
          hz310: 32,
          hz600: 32,
          hz1000: 32,
          hz3000: 32,
          hz12000: 32,
          hz14000: 32,
          hz16000: 32,
          hz6000: 32,
          name: "Entry1",
          preamp: 32
        }
      ],
      type: "Winamp EQ library file v1.1"
    };
    expect(actual).toEqual(expected);
  });
});

describe("nextTrack", () => {
  it("returns null if you don't have any tracks", () => {
    const state = {
      playlist: { currentTrack: null, trackOrder: [] },
      media: { repeat: false }
    };
    expect(state.playlist.trackOrder).toEqual([]);
    expect(nextTrack(state)).toBe(null);
  });

  it("returns null if you are going forward from the last track and repeat is not turned on", () => {
    const state = {
      playlist: { currentTrack: 3, trackOrder: [1, 2, 3] },
      media: { repeat: false }
    };
    expect(nextTrack(state)).toBe(null);
  });

  it("wraps around if you are going forward from the last track and repeat _is_ turned on", () => {
    const state = {
      playlist: { currentTrack: 3, trackOrder: [1, 2, 3] },
      media: { repeat: true }
    };
    expect(nextTrack(state)).toBe(1);
  });

  it("returns null if you are going backward from the first track and repeat is not turned on", () => {
    const state = {
      playlist: { currentTrack: 1, trackOrder: [1, 2, 3] },
      media: { repeat: false }
    };
    expect(nextTrack(state, -1)).toBe(null);
  });

  it("wraps around if you are going backwards from the first track and repeat _is_ turned on", () => {
    const state = {
      playlist: { currentTrack: 1, trackOrder: [1, 2, 3] },
      media: { repeat: true }
    };
    expect(nextTrack(state, -1)).toBe(3);
  });

  it("does a normal next", () => {
    const state = {
      playlist: { currentTrack: 2, trackOrder: [1, 2, 3] },
      media: { repeat: false }
    };
    expect(nextTrack(state)).toBe(3);
  });

  it("does a normal previous", () => {
    const state = {
      playlist: { currentTrack: 2, trackOrder: [1, 2, 3] },
      media: { repeat: false }
    };
    expect(nextTrack(state, -1)).toBe(1);
  });

  it("takes you to the last track if you overshoot", () => {
    const state = {
      playlist: { currentTrack: 2, trackOrder: [1, 2, 3] },
      media: { repeat: false }
    };
    expect(nextTrack(state, 10)).toBe(3);
  });

  it("takes you to the first track if you overshoot", () => {
    const state = {
      playlist: { currentTrack: 2, trackOrder: [1, 2, 3] },
      media: { repeat: false }
    };
    expect(nextTrack(state, -10)).toBe(1);
  });
});
