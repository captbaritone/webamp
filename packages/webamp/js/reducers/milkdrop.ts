import { Action, StatePreset, TransitionType, MilkdropMessage } from "../types";
import * as Utils from "../utils";

export interface MilkdropState {
  display: "WINDOW" | "DESKTOP" | "FULLSCREEN";
  overlay: boolean;
  presetHistory: number[];
  presets: StatePreset[];
  currentPresetIndex: number | null;
  butterchurn: any;
  transitionType: TransitionType;
  randomize: boolean;
  cycling: boolean;
  // TODO: This could probably be simplified to just a date and we could assume
  // the song title is the message.
  message: MilkdropMessage | null;
}

const defaultMilkdropState: MilkdropState = {
  display: "WINDOW",
  overlay: false,
  presetHistory: [],
  presets: [],
  currentPresetIndex: null,
  butterchurn: null,
  transitionType: TransitionType.DEFAULT,
  randomize: true,
  cycling: true,
  message: null,
};

export const milkdrop = (
  state: MilkdropState = defaultMilkdropState,
  action: Action
): MilkdropState => {
  switch (action.type) {
    case "SET_MILKDROP_DESKTOP":
      return { ...state, display: (action as any).enabled ? "DESKTOP" : "WINDOW" };
    case "SET_MILKDROP_FULLSCREEN":
      return { ...state, display: (action as any).enabled ? "FULLSCREEN" : "WINDOW" };
    case "GOT_BUTTERCHURN":
      return { ...state, butterchurn: (action as any).butterchurn };
    case "GOT_BUTTERCHURN_PRESETS":
      return {
        ...state,
        presets: state.presets.concat((action as any).presets),
      };
    case "PRESET_REQUESTED":
      if ((action as any).addToHistory) {
        return {
          ...state,
          presetHistory: [...state.presetHistory, (action as any).index],
        };
      }
      return {
        ...state,
        presetHistory: state.presetHistory.slice(0, -1),
      };
    case "RESOLVE_PRESET_AT_INDEX":
      const preset = state.presets[(action as any).index];
      return {
        ...state,
        presets: Utils.replaceAtIndex(state.presets, (action as any).index, {
          type: "RESOLVED",
          name: preset.name,
          preset: (action as any).json,
        }),
      };
    case "SELECT_PRESET_AT_INDEX":
      return {
        ...state,
        currentPresetIndex: (action as any).index,
        transitionType: (action as any).transitionType,
      };
    case "TOGGLE_PRESET_OVERLAY":
      return { ...state, overlay: !state.overlay };
    case "TOGGLE_RANDOMIZE_PRESETS":
      return { ...state, randomize: !state.randomize };
    case "TOGGLE_PRESET_CYCLING":
      return { ...state, cycling: !state.cycling };
    case "SCHEDULE_MILKDROP_MESSAGE":
      return {
        ...state,
        message: {
          text: (action as any).message,
          time: Date.now(),
        },
      };
    default:
      return state;
  }
};

export default milkdrop;
