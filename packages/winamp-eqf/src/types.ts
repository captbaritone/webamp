import { PresetValueKey } from "./constants.js";

export interface EqfPreset {
  name: string;
  hz60: number;
  hz170: number;
  hz310: number;
  hz600: number;
  hz1000: number;
  hz3000: number;
  hz6000: number;
  hz12000: number;
  hz14000: number;
  hz16000: number;
  preamp: number;
}

export interface EqfData {
  type: string;
  presets: EqfPreset[];
}

export interface CreateEqfData {
  presets: Array<
    {
      [K in PresetValueKey]: number;
    } & {
      name: string;
    }
  >;
}
