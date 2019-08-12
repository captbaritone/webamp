import { ModernAppState, ModernAction } from "./types";
import { createStore } from "redux";

const defaultState = { makiTree: null };

function reducer(
  state: ModernAppState = defaultState,
  action: ModernAction
): ModernAppState {
  switch (action.type) {
    case "SET_MAKI_TREE":
      return { ...state, makiTree: action.makiTree };
    default:
      return state;
  }
}

export function create() {
  return createStore(reducer);
}
