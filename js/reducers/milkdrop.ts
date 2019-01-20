import { Action } from "../types";
import { SET_MILKDROP_DESKTOP, INITIALIZE_PRESETS } from "../actionTypes";
import { bindActionCreators } from "redux";

export interface MilkdropState {
  desktop: boolean;
  presets: any;
}

const defaultMilkdropState = {
  desktop: false,
  presets: null
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
    default:
      return state;
  }
};

export default milkdrop;
