/**
 * NOTE: This file must not import any other types
 */

export interface WindowsSerializedStateV1 {
  positionsAreRelative: boolean;
  genWindows: {
    [windowId: string]: {
      size: [number, number];
      open: boolean;
      hidden: boolean;
      shade: boolean;
      position: { x: number; y: number };
    };
  };
  focused: string | null;
}

export interface DisplaySerializedStateV1 {
  visualizerStyle: number;
  doubled: boolean;
  llama: boolean;
  marqueeStep: number;
  skinImages: { [sprite: string]: string };
  skinCursors: { [cursor: string]: string } | null;
  skinRegion: { [windowName: string]: string[] };
  skinGenLetterWidths: { [letter: string]: number } | null;
  skinColors: string[]; // Theoretically this could be a tuple of a specific length
  skinPlaylistStyle: {
    normal: string;
    current: string;
    normalbg: string;
    selectedbg: string;
    font: string;
  } | null;
}

export interface EqualizerSerializedStateV1 {
  on: boolean;
  auto: boolean;
  sliders: Record<
    | 60
    | 170
    | 310
    | 600
    | 1000
    | 3000
    | 6000
    | 12000
    | 14000
    | 16000
    | "preamp",
    number
  >;
}

export interface MediaSerializedStateV1 {
  volume: number;
  balance: number;
  shuffle: boolean;
  repeat: boolean;
}

export interface SerializedStateV1 {
  version: 1;
  windows: WindowsSerializedStateV1;
  media: MediaSerializedStateV1;
  display: DisplaySerializedStateV1;
  equalizer: EqualizerSerializedStateV1;
}
