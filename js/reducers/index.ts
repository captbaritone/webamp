import { AppState, Action } from "../types";
import { combineReducers } from "redux";

import playlist from "./playlist";
import windows from "./windows";
import media from "./media";
import display from "./display";
import userInput from "./userInput";
import equalizer from "./equalizer";
import network from "./network";
import settings from "./settings";
import tracks from "./tracks";

const reducer = combineReducers<AppState, Action>({
  userInput,
  windows,
  display,
  settings,
  equalizer,
  playlist,
  media,
  network,
  tracks
});

export default reducer;
