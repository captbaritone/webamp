// This is a temporary module intended to collect all the places where the demo
// site reaches out into Webamp code. The goal is to eventually have the demo
// site consume the actual Webamp NPM module, so hopefully this module can go
// away once we've figured out how to expose all the things that the demo site
// needs, or reduce the things that the demo site needs access to.

export {
  default as WebampLazy,
  Options,
  PrivateOptions,
  WindowLayout,
} from "../../js/webampLazy";
export {
  ButterchurnOptions,
  Track,
  AppState,
  URLTrack,
  FilePicker,
  Action,
} from "../../js/types";
export { WINDOWS } from "../../js/constants";
export {
  STEP_MARQUEE,
  UPDATE_TIME_ELAPSED,
  UPDATE_WINDOW_POSITIONS,
  SET_VOLUME,
  SET_BALANCE,
  SET_BAND_VALUE,
  DISABLE_MARQUEE,
  TOGGLE_REPEAT,
  TOGGLE_SHUFFLE,
  SET_EQ_AUTO,
  SET_DUMMY_VIZ_DATA,
} from "../../js/actionTypes";
export { loadPresets } from "../../js/actionCreators";
