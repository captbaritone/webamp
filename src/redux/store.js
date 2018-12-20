import { createStore as createReduxStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";
import * as Selectors from "./selectors";
import rootEpic from "./epics";

const defaultState = {
  searchQuery: null,
  selectedSkinHash: null,
  selectedSkinPosition: null,
  matchingHashes: null,
  skinZip: null,
  focusedSkinFile: null
};

function reducer(state = defaultState, action) {
  switch (action.type) {
    case "SELECTED_SKIN":
      return {
        ...state,
        selectedSkinHash: action.hash,
        selectedSkinPosition: action.position,
        skinZip: null
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        selectedSkinHash: null,
        selectedSkinPosition: null,
        skinZip: null
      };
    case "SEARCH_QUERY_CHANGED":
      return {
        ...state,
        searchQuery: action.query,
        selectedSkinHash: null,
        selectedSkinPosition: null
      };
    case "GOT_NEW_MATCHING_HASHES":
      return {
        ...state,
        matchingHashes: action.matchingHashes
      };
    case "LOADED_SKIN_ZIP":
      return {
        ...state,
        skinZip: action.zip
      };
    case "SELECTED_SKIN_FILE_TO_FOCUS": {
      return {
        ...state,
        focusedSkinFile: {
          content: null,
          ext: action.ext,
          fileName: action.fileName
        }
      };
    }
    case "GOT_FOCUSED_SKIN_FILE":
      return {
        ...state,
        focusedSkinFile: {
          ...state.focusedSkinFile,
          content: action.content
        }
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
