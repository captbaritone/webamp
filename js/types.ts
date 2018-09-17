type Skin = {
  url: string;
  name: string;
};


type Band = null; // TODO: Use a real type here.

// TODO: Use a type to ensure these keys mirror the CURSORS constant in
// skinParser.js
type Cursors = {[cursor: string]: string}

type GenLetterWidths = {[letter: string]: number};

// TODO: Use a type to ensure the keys are one of the known values in PLEDIT.txt
type PlaylistStyle = {[state: string]: string};

// TODO: Type these keys.
type SkinImages = {[sprite: string]: string};

// TODO: type these keys
type SkinRegion = {[windowName: string]: string[]}

// TODO: Fill these out once we actually use them.
type SkinData = {
      skinImages: SkinImages;
      skinColors: string[];
      skinPlaylistStyle: PlaylistStyle;
      skinCursors: Cursors;
      skinRegion: SkinRegion;
      skinGenLetterWidths: GenLetterWidths;
      }

export type Action =
  | {
      type: "NETWORK_CONNECTED";
    }
  | {
      type: "NETWORK_DISCONNECTED";
    }
  | {
      type: "SET_AVAILABLE_SKINS";
      skins: Array<Skin>;
  }
  | {
      type: "PLAY";
  }
  | {
      type: "IS_PLAYING";
  }
  | {
      type: "PAUSE";
  }
  | {
      type: "STOP";
  }
  | {
      type: "IS_STOPPED";
  }
  | {
      type: "CHANNEL_COUNT_CHANGED";
      channels: number;
  } | {
      type: "TOGGLE_TIME_MODE";
  } | {
      type: "UPDATE_TIME_ELAPSED";
      elapsed: number;
  } | {
      type: "ADD_TRACK_FROM_URL";
  } | {
      type: "SET_MEDIA";
      length: number;
      kbps: number;
      khz: number;
      channels: number;
  } | {
      type: "SET_VOLUME";
      volume: number;
  } | {
      type: "SET_BALANCE";
      balance: number;
  } | {
      type: "TOGGLE_REPEAT";
  } | {
      type: "TOGGLE_SHUFFLE";
  } | {
      type: "SET_FOCUS";
      input: string;
  } | {
      type: "SET_BAND_FOCUS";
      input: string;
      bandFocused: Band;
  } | {
      type: "UNSET_FOCUS";
  } | {
      type: "SET_SCRUB_POSITION";
      position: number;
  } | {
      type: "SET_USER_MESSAGE";
      message: string;
  } | {
      type: "UNSET_USER_MESSAGE";
  } | {
      type: "TOGGLE_DOUBLESIZE_MODE";
  } | {
      type: "TOGGLE_LLAMA_MODE";
  } | {
      type: "STEP_MARQUEE";
  } | {
      type: "DISABLE_MARQUEE";
  } | {
      type: "STOP_WORKING";
  } | {
      type: "START_WORKING";
  } | {
      type: "CLOSE_WINAMP";
  } | {
      type: "LOADING";
  } | {
      type: "LOADED";
  } | {
      type: "SET_SKIN_DATA";
      data: SkinData;
  } | {
      type: "TOGGLE_VISUALIZER_STYLE";
  } | {
      type: "REGISTER_VISUALIZER";
      id: string;
  } | {
      type: "SET_PLAYLIST_SCROLL_POSITION";
      position: number;
  } | {
      type: "SET_Z_INDEX";
      zIndex: number;
  } | {
      type: "SET_DUMMY_VIZ_DATA";
      data: null;
    };

export interface SettingsState {
  availableSkins: Array<Skin>;
}

export interface NetworkState {
  connected: boolean;
}

export interface MediaState {
  timeMode: string; // TODO: Convert this to an enum
  timeElapsed: number;
  length: number | null;
  kbps: number| null;
  khz: number | null;
  volume: number;
  balance: number;
  channels: number | null; // TODO: Convert this to an enum
  shuffle: boolean;
  repeat: boolean;
  status: string | null; // TODO: Convert this to an enum
}

export interface UserInputState {
  focus: string | null; // TODO: Convert this to an enum?
  bandFocused: Band;
  scrubPosition: number;
  userMessage: string | null;
}

export interface DisplayState {
  additionalVisualizers: Array<string>;
  visualizerStyle: number;
  doubled: boolean;
  llama: boolean;
  disableMarquee: boolean;
  marqueeStep: number;
  skinImages: SkinImages;
  skinCursors: Cursors | null;
  skinRegion: SkinRegion;
  skinGenLetterWidths: GenLetterWidths | null;
  skinColors: string[]; // Theoretically this could be a tuple of a specific length
  skinPlaylistStyle: PlaylistStyle | null;
  working: boolean;
  closed: boolean;
  loading: boolean;
  playlistScrollPosition: number;
  zIndex: number
  dummyVizData: null; // TODO: Figure out what kind of data this actually is.
}