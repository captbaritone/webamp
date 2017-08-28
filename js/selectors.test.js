import reducer from "./reducers";
import { getEqfData } from "./selectors";
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
