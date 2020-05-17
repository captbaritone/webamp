import { SET_FOCUS, SET_SCRUB_POSITION, UNSET_FOCUS } from "../actionTypes";
import userInput from "./userInput";

describe("userInput reducer", () => {
  const state = userInput(undefined, { type: "@@INIT" });
  it("has sensible defaults", () => {
    expect(state).toEqual({
      focus: null,
      scrubPosition: 0,
      bandFocused: null,
      userMessage: null,
    });
  });
  it("can set focus", () => {
    const newState = userInput(state, {
      type: SET_FOCUS,
      input: "foo",
      bandFocused: null,
      userMessage: null,
    });
    expect(newState).toEqual({
      focus: "foo",
      scrubPosition: 0,
      bandFocused: null,
      userMessage: null,
    });
  });
  it("can unset focus", () => {
    const newState = userInput(
      { ...state, focus: "foo", bandFocused: null },
      { type: UNSET_FOCUS }
    );
    expect(newState).toEqual({
      focus: null,
      scrubPosition: 0,
      bandFocused: null,
      userMessage: null,
    });
  });
  it("can set scrub position", () => {
    const newState = userInput(state, {
      type: SET_SCRUB_POSITION,
      position: 5,
      bandFocused: null,
      userMessage: null,
    });
    expect(newState).toEqual({
      focus: null,
      scrubPosition: 5,
      bandFocused: null,
      userMessage: null,
    });
  });
});
