import { AppState, Action } from "../types";
import { Reducer, combineReducers } from "redux";

import playlist from "./playlist";
import windows from "./windows";
import media from "./media";
import display from "./display";
import userInput from "./userInput";
import equalizer from "./equalizer";
import network from "./network";
import settings from "./settings";
import tracks from "./tracks";
import milkdrop from "./milkdrop";

const reducer: Reducer<AppState, Action, never> = combineReducers({
  userInput,
  windows,
  display,
  settings,
  equalizer,
  playlist,
  media,
  network,
  tracks,
  milkdrop,
});

export default reducer;
