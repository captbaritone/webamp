import { ModernSkinState, ModernAction } from "./types";
import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";

const defaultState = {
  makiTree: null,
  volume: 127,
  rightVUMeter: 127,
  leftVUMeter: 127,
  xmlTree: null,
  skinLoaded: false,
};

function modernSkinReducer(
  state: ModernSkinState = defaultState,
  action: ModernAction
): ModernSkinState {
  switch (action.type) {
    case "SET_MAKI_TREE":
      return { ...state, makiTree: action.makiTree, skinLoaded: true };
    case "SET_XML_TREE":
      return { ...state, xmlTree: action.xmlTree };
    case "SKIN_UNLOADED":
      return { ...state, xmlTree: null, makiTree: null, skinLoaded: false };
    case "SET_VOLUME":
      return { ...state, volume: action.volume };
    default:
      return state;
  }
}

const reducer = combineReducers({
  modernSkin: modernSkinReducer,
});

export function create() {
  return createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));
}
