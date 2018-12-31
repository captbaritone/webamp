import { Action } from "../types";
import { SET_MILKDROP_DESKTOP } from "../actionTypes";

export interface MilkdropState {
  desktop: boolean;
}

const defaultMilkdropState = {
  desktop: false
};

export const milkdrop = (
  state: MilkdropState = defaultMilkdropState,
  action: Action
): MilkdropState => {
  switch (action.type) {
    case SET_MILKDROP_DESKTOP:
      return { ...state, desktop: action.enabled };
    default:
      return state;
  }
};

export default milkdrop;
