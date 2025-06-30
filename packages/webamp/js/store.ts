import {
  legacy_createStore as createStore,
  applyMiddleware,
  Middleware as ReduxMiddleware,
} from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension";
import reducer from "./reducers";
import mediaMiddleware from "./mediaMiddleware";
import { merge } from "./utils";
import { UPDATE_TIME_ELAPSED, STEP_MARQUEE } from "./actionTypes";
import { IMedia } from "./media";
import Emitter from "./emitter";
import {
  Extras,
  Dispatch,
  Action,
  PartialState,
  Middleware,
  Store,
} from "./types";

const compose = composeWithDevTools({
  actionsDenylist: [UPDATE_TIME_ELAPSED, STEP_MARQUEE],
});

export default function createWebampStore(
  media: IMedia,
  actionEmitter: Emitter,
  customMiddlewares: Middleware[] = [],
  stateOverrides: PartialState | undefined,
  extras: Extras
): Store {
  let initialState;
  if (stateOverrides) {
    initialState = merge(
      reducer(undefined, { type: "@@init" }),
      stateOverrides
    );
  }

  const emitterMiddleware = () => (next: Dispatch) => (action: Action) => {
    actionEmitter.trigger(action.type, action);
    return next(action);
  };

  const middlewares: Middleware[] = [
    thunk.withExtraArgument(extras),
    mediaMiddleware(media),
    emitterMiddleware,
    ...customMiddlewares,
  ];

  // @ts-expect-error Typing of these is too hard to get right, so we cheat
  const coercedMiddlewares: ReduxMiddleware[] = middlewares;

  const enhancer = compose(applyMiddleware(...coercedMiddlewares));

  return createStore(reducer, initialState, enhancer);
}
