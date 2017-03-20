import { userInput } from "./reducers";
import { SET_FOCUS, SET_SCRUB_POSITION, UNSET_FOCUS } from "./actionTypes";

describe("userInput reducer", () => {
  const state = userInput();
  it("has sensible defaults", () => {
    expect(state).toEqual({ focus: null, scrubPosition: 0 });
  });
  it("can set focus", () => {
    const newState = userInput(state, { type: SET_FOCUS, input: "foo" });
    expect(newState).toEqual({ focus: "foo", scrubPosition: 0 });
  });
  it("can unset focus", () => {
    const newState = userInput(
      { ...state, focus: "foo" },
      { type: UNSET_FOCUS }
    );
    expect(newState).toEqual({ focus: null, scrubPosition: 0 });
  });
  it("can set scrub position", () => {
    const newState = userInput(state, {
      type: SET_SCRUB_POSITION,
      position: 5
    });
    expect(newState).toEqual({ focus: null, scrubPosition: 5 });
  });
});
