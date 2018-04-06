import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./reducers";
import mediaMiddleware from "./mediaMiddleware";
import analyticsMiddleware from "./analyticsMiddleware";
import { merge } from "./utils";
import { UPDATE_TIME_ELAPSED, STEP_MARQUEE } from "./actionTypes";

const compose = composeWithDevTools({
  actionsBlacklist: [UPDATE_TIME_ELAPSED, STEP_MARQUEE]
});

const getStore = (media, actionEmitter, customMiddleware, stateOverrides) => {
  let initialState;
  if (stateOverrides) {
    initialState = merge(
      reducer(undefined, { type: "@@init" }),
      stateOverrides
    );
  }

  // eslint-disable-next-line no-unused-vars
  const emitterMiddleware = store => next => action => {
    actionEmitter.trigger(action.type);
    return next(action);
  };

  return createStore(
    reducer,
    initialState,
    compose(
      applyMiddleware(
        ...[
          thunk,
          mediaMiddleware(media),
          emitterMiddleware,
          customMiddleware,
          analyticsMiddleware
        ].filter(Boolean)
      )
    )
  );
};

export default getStore;
