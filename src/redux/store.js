import { createStore as createReduxStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";
import * as Selectors from "./selectors";
import rootEpic from "./epics";

const defaultState = {
  searchQuery: null,
  selectedSkinHash: null,
  selectedSkinPosition: null,
  matchingHashes: null
};

function reducer(state = defaultState, action) {
  switch (action.type) {
    case "SELECT_SKIN":
      return {
        ...state,
        selectedSkinHash: action.hash,
        selectedSkinPosition: action.position
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        selectedSkinHash: null,
        selectedSkinPosition: null
      };
    case "SEARCH_QUERY_CHANGED":
      return {
        ...state,
        searchQuery: action.query
      };
    case "GOT_NEW_MATCHING_HASHES":
      return {
        ...state,
        matchingHashes: action.matchingHashes
      };
    default:
      return state;
  }
}
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
