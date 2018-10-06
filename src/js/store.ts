import { createStore, applyMiddleware, DeepPartial } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./reducers";
import mediaMiddleware from "./mediaMiddleware";
import { merge } from "./utils";
import { UPDATE_TIME_ELAPSED, STEP_MARQUEE } from "./actionTypes";
import Media from "./media";
import Emitter from "./emitter";
import { Extras, MiddlewareStore, Dispatch, Action, AppState } from "./types";

const compose = composeWithDevTools({
  actionsBlacklist: [UPDATE_TIME_ELAPSED, STEP_MARQUEE]
});

export default function(
  media: Media,
  actionEmitter: Emitter,
  customMiddlewares = [],
  stateOverrides: DeepPartial<AppState>,
  extras: Extras
) {
  let initialState;
  if (stateOverrides) {
    initialState = merge(
      reducer(undefined, { type: "@@init" }),
      stateOverrides
    );
  }

  // eslint-disable-next-line no-unused-vars
  const emitterMiddleware = (store: MiddlewareStore) => (next: Dispatch) => (
    action: Action
  ) => {
    actionEmitter.trigger(action.type, action);
    return next(action);
  };

  const enhancer = compose(
    applyMiddleware(
      ...[
        thunk.withExtraArgument(extras),
        mediaMiddleware(media),
        emitterMiddleware,
        ...customMiddlewares
      ].filter(Boolean)
    )
  );

  // The Redux types are a bit confused, and don't realize that passing an
  // undefined initialState is allowed.
  const store = initialState
    ? createStore(reducer, initialState, enhancer)
    : createStore(reducer, enhancer);
  return store;
}
