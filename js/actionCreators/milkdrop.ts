import { INITIALIZE_PRESETS } from "../actionTypes";
import { Dispatchable } from "../types";

export function initializePresets(presets: any): Dispatchable {
  return { type: INITIALIZE_PRESETS, presets };
}
