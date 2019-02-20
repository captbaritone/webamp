import { createStore as createReduxStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";
import * as Selectors from "./selectors";
import rootEpic from "./epics";
import reducer from "./reducer";

export function createStore() {
  const epicMiddleware = createEpicMiddleware();

  const store = createReduxStore(reducer, applyMiddleware(epicMiddleware));
  epicMiddleware.run(rootEpic);
  let lastUrl = null;
  window.onpopstate = function() {
    store.dispatch({ type: "URL_CHANGED", location: document.location });
  };
  store.dispatch({ type: "URL_CHANGED", location: document.location });
  store.subscribe(() => {
    const state = store.getState();
    const url = Selectors.getUrl(state);
    if (url !== lastUrl) {
      window.history.pushState({}, Selectors.getPageTitle(state), url);
      lastUrl = url;
    }
  });
  return store;
}
