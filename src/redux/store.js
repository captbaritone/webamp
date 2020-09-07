import { createStore as createReduxStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";
import * as Selectors from "./selectors";
import * as Actions from "./actionCreators";
import rootEpic from "./epics";
import reducer from "./reducer";

export function createStore() {
  const epicMiddleware = createEpicMiddleware();

  const store = createReduxStore(reducer, applyMiddleware(epicMiddleware));
  epicMiddleware.run(rootEpic);
  let lastUrl = window.location.pathname;
  window.onpopstate = function () {
    store.dispatch({ type: "URL_CHANGED", location: document.location });
  };
  store.dispatch({ type: "URL_CHANGED", location: document.location });
  // TODO: We could maybe get this going eaven before JS starts parsing...
  store.dispatch(Actions.requestUnloadedSkin(0));
  store.subscribe(() => {
    const state = store.getState();
    const url = Selectors.getUrl(state);
    if (url !== lastUrl) {
      console.log(
        `url ${url} does not match ${lastUrl} so we're adding a history entry`
      );
      window.ga("set", "page", url);
      if (lastUrl != null) {
        window.ga("send", "pageview");
      }
      window.history.replaceState({}, Selectors.getPageTitle(state), url);
      lastUrl = url;
    }
  });
  return store;
}
