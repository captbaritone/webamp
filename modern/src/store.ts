import { ModernAppState, ModernAction } from "./types";
import { createStore } from "redux";

const defaultState = {};

function reducer(
  state: ModernAppState = defaultState,
  action: ModernAction
): ModernAppState {
  switch (action.type) {
    default:
      return state;
  }
}

export function create() {
  return createStore(reducer);
}
