import { createStore as createReduxStore } from "redux";
import * as Selectors from "./selectors";

const defaultState = {
  selectedSkinHash: null,
  selectedSkinPosition: null
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
      if (action.location.pathname.startsWith("/skin/")) {
        const segments = action.location.pathname.split("/");
        return {
          ...state,
          selectedSkinHash: segments[2],
          // TODO: This makes no sense
          selectedSkinPosition: null
        };
      }
      return defaultState;
    default:
      return state;
  }
}
export function createStore() {
  const store = createReduxStore(reducer);
  let lastUrl = null;
  store.subscribe(() => {
    const state = store.getState();
    const url = Selectors.getUrl(state);
    if (url != lastUrl) {
      window.history.pushState({}, Selectors.getPageTitle(state), url);
      lastUrl = url;
    }
  });
  window.onpopstate = function(event) {
    const { state } = event;
    store.dispatch({ type: "URL_CHANGED", location: document.location });
  };
  store.dispatch({ type: "URL_CHANGED", location: document.location });
  return store;
}
