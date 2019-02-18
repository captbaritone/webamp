import { Action, PresetId, Preset } from "../types";
import {
  SET_MILKDROP_DESKTOP,
  GOT_BUTTERCHURN_PRESETS,
  GOT_BUTTERCHURN,
  RESOLVE_PRESET_AT_INDEX,
  SELECT_PRESET_AT_INDEX,
  TOGGLE_PRESET_OVERLAY
} from "../actionTypes";
import * as Utils from "../utils";
import { TransitionType } from "../types";

export interface MilkdropState {
  desktop: boolean;
  overlay: boolean;
  presetOrder: PresetId[];
  presets: Preset[];
  currentPresetIndex: number | null;
  butterchurn: any;
  transitionType: TransitionType;
}

const defaultMilkdropState = {
  desktop: false,
  overlay: false,
  presetOrder: [],
  presets: [],
  currentPresetIndex: null,
  butterchurn: null,
  transitionType: TransitionType.DEFAULT
};

export const milkdrop = (
  state: MilkdropState = defaultMilkdropState,
  action: Action
): MilkdropState => {
  switch (action.type) {
    case SET_MILKDROP_DESKTOP:
      return { ...state, desktop: action.enabled };
    case GOT_BUTTERCHURN:
      return { ...state, butterchurn: action.butterchurn };
    case GOT_BUTTERCHURN_PRESETS:
      return {
        ...state,
        presets: state.presets.concat(
          action.presets.map(preset => {
            switch (preset.type) {
              case "BUTTERCHURN_JSON":
              case "LAZY_BUTTERCHURN_JSON":
                return preset;
            }
          })
        )
      };
    case RESOLVE_PRESET_AT_INDEX:
      const preset = state.presets[action.index];
      return {
        ...state,
        presets: Utils.replaceAtIndex(state.presets, action.index, {
          name: preset.name,
          type: "BUTTERCHURN_JSON",
          definition: action.json
        })
      };
    case SELECT_PRESET_AT_INDEX:
      return {
        ...state,
        currentPresetIndex: action.index,
        transitionType: action.transitionType
      };
    case TOGGLE_PRESET_OVERLAY:
      return { ...state, overlay: !state.overlay };
    default:
      return state;
  }
};

export default milkdrop;
