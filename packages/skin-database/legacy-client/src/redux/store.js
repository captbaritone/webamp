import { createStore as createReduxStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";
import * as Actions from "./actionCreators";
import rootEpic from "./epics";
import reducer from "./reducer";

// The href we last told the store about via URL_CHANGED.
let lastSyncedHref = null;

/**
 * Tell the store about the current URL.
 *
 * The store lives in the root layout and outlives Next.js client-side
 * navigations (e.g. from /scroll to /upload), which don't fire popstate. The
 * legacy layout calls this on mount so the store picks up where we landed.
 * Unless `force` is set, it's a no-op if the store has already seen this URL,
 * so the store's own initial sync isn't repeated.
 */
export function syncUrlToStore(store, { force = false } = {}) {
  const href = document.location.href;
  if (!force && href === lastSyncedHref) {
    return;
  }
  lastSyncedHref = href;
  store.dispatch({ type: "URL_CHANGED", location: document.location });
}

export function createStore() {
  const epicMiddleware = createEpicMiddleware();

  const store = createReduxStore(reducer, applyMiddleware(epicMiddleware));
  epicMiddleware.run(rootEpic);
  window.onpopstate = function () {
    syncUrlToStore(store, { force: true });
  };
  syncUrlToStore(store, { force: true });
  // TODO: We could maybe get this going eaven before JS starts parsing...
  store.dispatch(Actions.requestUnloadedSkin(0));
  return store;
}
