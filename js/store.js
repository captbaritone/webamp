import { createStore, applyMiddleware } from "redux";
import reducer from "./reducers";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import mediaMiddleware from "./mediaMiddleware";

const getStore = (winamp, initialState) =>
  createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunk, mediaMiddleware(winamp.media)))
  );

export default getStore;
