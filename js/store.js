import { createStore, applyMiddleware } from "redux";
import reducer from "./reducers";
import thunk from "redux-thunk";
import mediaMiddleware from "./mediaMiddleware";

const getStore = winamp =>
  createStore(
    reducer,
    window.devToolsExtension && window.devToolsExtension(),
    applyMiddleware(thunk, mediaMiddleware(winamp.media))
  );

export default getStore;
