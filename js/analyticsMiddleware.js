/* global ga */
import {
  STEP_MARQUEE,
  SET_SCRUB_POSITION,
  SET_VOLUME,
  UPDATE_TIME_ELAPSED,
  SET_BALANCE,
  SET_BAND_VALUE
} from "./actionTypes";

const excludeActionTypes = new Set([
  STEP_MARQUEE,
  SET_SCRUB_POSITION,
  SET_VOLUME,
  UPDATE_TIME_ELAPSED,
  SET_BALANCE,
  SET_BAND_VALUE
]);

export default function analyticsMiddleware() {
  return next => action => {
    if (!excludeActionTypes.has(action.type) && typeof ga !== "undefined") {
      ga("send", {
        hitType: "event",
        eventCategory: "Redux Store", // Typically the object that was interacted with (e.g. 'Video')
        eventAction: action.type // The type of interaction (e.g. 'play')
        // eventLabel: "Fall Campaign", // Useful for categorizing events (e.g. 'Fall Campaign')
        // eventValue: "Fall Campaign" // A numeric value associated with the event (e.g. 42)
      });
    }
    return next(action);
  };
}
