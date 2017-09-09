import { createStore, applyMiddleware } from "redux";
import reducer from "./reducers";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import mediaMiddleware from "./mediaMiddleware";
import analyticsMiddleware from "./analyticsMiddleware";
import { merge } from "./utils";

const getStore = (winamp, stateOverrides) => {
  let initialState;
  if (stateOverrides) {
    initialState = merge(
      reducer(undefined, { type: "@@init" }),
      stateOverrides
    );
  }
  return createStore(
    reducer,
    initialState,
    composeWithDevTools(
      applyMiddleware(thunk, mediaMiddleware(winamp.media), analyticsMiddleware)
    )
  );
};

export default getStore;
