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
    case "URL_CHANGED":
      const params = new URLSearchParams(action.location.search);
      const searchQuery = params != null && params.get("query");
      if (action.location.pathname.startsWith("/skin/")) {
        const segments = action.location.pathname.split("/");
        return {
          ...state,
          selectedSkinHash: segments[2],
          // TODO: This makes no sense
          selectedSkinPosition: null,
          searchQuery
        };
      }
      return { ...defaultState, searchQuery };
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
  store.subscribe(() => {
    const state = store.getState();
    const url = Selectors.getUrl(state);
    if (url !== lastUrl) {
      window.history.pushState({}, Selectors.getPageTitle(state), url);
      lastUrl = url;
    }
  });
  window.onpopstate = function() {
    store.dispatch({ type: "URL_CHANGED", location: document.location });
  };
  store.dispatch({ type: "URL_CHANGED", location: document.location });
  return store;
}
