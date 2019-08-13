import { ModernAppState, ModernAction } from "./types";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";

const defaultState = { makiTree: null, volume: 127 };

function reducer(
  state: ModernAppState = defaultState,
  action: ModernAction
): ModernAppState {
  switch (action.type) {
    case "SET_MAKI_TREE":
      return { ...state, makiTree: action.makiTree };
    case "SET_VOLUME":
      return { ...state, volume: action.volume };

    default:
      return state;
  }
}

export function create() {
  return createStore(reducer, applyMiddleware(thunk));
}
