import { Action, Slider } from "../types";

export interface UserInputState {
  focus: string | null; // TODO: Convert this to an enum?
  bandFocused: Slider | null;
  scrubPosition: number;
  userMessage: string | null;
}

const defaultUserInput = {
  focus: null,
  bandFocused: null,
  scrubPosition: 0,
  userMessage: null,
};

export const userInput = (
  state: UserInputState = defaultUserInput,
  action: Action
): UserInputState => {
  switch (action.type) {
    case "SET_FOCUS":
      return { ...state, focus: (action as any).input, bandFocused: null };
    case "SET_BAND_FOCUS":
      return {
        ...state,
        focus: (action as any).input,
        bandFocused: (action as any).bandFocused,
      };
    case "UNSET_FOCUS":
      return { ...state, focus: null, bandFocused: null };
    case "SET_SCRUB_POSITION":
      return { ...state, scrubPosition: (action as any).position };
    case "SET_USER_MESSAGE":
      return { ...state, userMessage: (action as any).message };
    case "UNSET_USER_MESSAGE":
      return { ...state, userMessage: null };
    default:
      return state;
  }
};

export default userInput;
