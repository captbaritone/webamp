import { Action } from "../types";
import {
  SET_MILKDROP_DESKTOP,
  INITIALIZE_PRESETS,
  GOT_BUTTERCHURN
} from "../actionTypes";
import { TransitionType } from "../types";

export interface MilkdropState {
  desktop: boolean;
  presets: any;
  butterchurn: any;
  transitionType: TransitionType;
}

const defaultMilkdropState = {
  desktop: false,
  presets: null,
  butterchurn: null,
  transitionType: TransitionType.DEFAULT
};

export const milkdrop = (
  state: MilkdropState = defaultMilkdropState,
  action: Action
): MilkdropState => {
  switch (action.type) {
    case SET_MILKDROP_DESKTOP:
      return { ...state, desktop: action.enabled };
    case INITIALIZE_PRESETS:
      return { ...state, presets: action.presets };
    case GOT_BUTTERCHURN:
      return { ...state, butterchurn: action.butterchurn };
    default:
      return state;
  }
};

export default milkdrop;
