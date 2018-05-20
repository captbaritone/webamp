import { CLOSE_WINAMP, STOP, TOGGLE_VISUALIZER_STYLE } from "../actionTypes";

export * from "./windows";
export * from "./media";
export * from "./equalizer";
export * from "./files";
export * from "./playlist";

export function close() {
  return dispatch => {
    dispatch({ type: STOP });
    dispatch({ type: CLOSE_WINAMP });
  };
}

export function toggleVisualizerStyle() {
  return { type: TOGGLE_VISUALIZER_STYLE };
}
