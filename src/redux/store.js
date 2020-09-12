import { createStore as createReduxStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";
import * as Actions from "./actionCreators";
import rootEpic from "./epics";
import reducer from "./reducer";

export function createStore() {
  const epicMiddleware = createEpicMiddleware();

  const store = createReduxStore(reducer, applyMiddleware(epicMiddleware));
  epicMiddleware.run(rootEpic);
  window.onpopstate = function () {
    store.dispatch({ type: "URL_CHANGED", location: document.location });
  };
  store.dispatch({ type: "URL_CHANGED", location: document.location });
  // TODO: We could maybe get this going eaven before JS starts parsing...
  store.dispatch(Actions.requestUnloadedSkin(0));
  return store;
}
