import { Action } from "../types";
import {
  SET_MILKDROP_DESKTOP,
  INITIALIZE_PRESETS,
  GOT_BUTTERCHURN
} from "../actionTypes";
import { TransitionType } from "../types";

// This is what we actually pass to butterchurn
type ButterchurnPresetJson = {
  type: "BUTTERCHURN_JSON";
  name: string;
  definition: any;
};

// A URL that points to a Butterchurn preset
interface ButterchurnPresetUrl {
  type: "BUTTERCHURN_URL";
  url: string;
}

// A URL that points to a .milk preset
interface MilkdropPresetUrl {
  type: "MILKDROP_URL";
  url: string;
}

type PresetDefinition =
  | ButterchurnPresetJson
  | ButterchurnPresetUrl
  | MilkdropPresetUrl;

type LazyPresetDefinition = () => Promise<PresetDefinition>;

type PresetId = string;

export interface MilkdropState {
  desktop: boolean;
  presetOrder: PresetId[];
  presetDefinitions: {
    [presetId: string]: PresetDefinition | LazyPresetDefinition;
  };
  currentPresetIndex: number | null;
  butterchurn: any;
  transitionType: TransitionType;
}

const defaultMilkdropState = {
  desktop: false,
  presetOrder: [],
  presetDefinitions: {},
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
    case "GOT_BUTTERCHUN_PRESET":
      const id = "TEMP";
      return {
        ...state,
        presetDefinitions: {
          [id]: action.json
        },
        currentPresetIndex: 0,
        presetOrder: [id]
      };
    default:
      return state;
  }
};

export default milkdrop;
