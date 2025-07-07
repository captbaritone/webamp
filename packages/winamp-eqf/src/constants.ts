export const PRESET_VALUES = [
  "hz60",
  "hz170",
  "hz310",
  "hz600",
  "hz1000",
  "hz3000",
  "hz6000",
  "hz12000",
  "hz14000",
  "hz16000",
  "preamp",
] as const;

export const HEADER = "Winamp EQ library file v1.1";

export type PresetValueKey = (typeof PRESET_VALUES)[number];
