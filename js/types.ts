type Skin = {
  url: string;
  name: string;
};

export type Band =
  | 60
  | 170
  | 310
  | 600
  | 1000
  | 3000
  | 6000
  | 12000
  | 14000
  | 16000;
type Slider = Band | "preamp";

// TODO: Use a type to ensure these keys mirror the CURSORS constant in
// skinParser.js
type Cursors = { [cursor: string]: string };

type GenLetterWidths = { [letter: string]: number };

// TODO: Use a type to ensure the keys are one of the known values in PLEDIT.txt
type PlaylistStyle = { [state: string]: string };

// TODO: Type these keys.
type SkinImages = { [sprite: string]: string };

// TODO: type these keys
type SkinRegion = { [windowName: string]: string[] };

export type WindowId = string;

// TODO: Fill these out once we actually use them.
type SkinData = {
  skinImages: SkinImages;
  skinColors: string[];
  skinPlaylistStyle: PlaylistStyle;
  skinCursors: Cursors;
  skinRegion: SkinRegion;
  skinGenLetterWidths: GenLetterWidths;
};

interface WindowPosition {
  x: number;
  y: number;
}
export type WindowPositions = {
  [windowId: string]: WindowPosition;
};
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
    }
  | {
      type: "TOGGLE_TIME_MODE";
    }
  | {
      type: "UPDATE_TIME_ELAPSED";
      elapsed: number;
    }
  | {
      type: "ADD_TRACK_FROM_URL";
      atIndex: number | null;
      id: string;
      defaultName: string;
      duration: number | null;
      url: string;
    }
  | {
      type: "SET_MEDIA";
      id: number;
      length: number;
      kbps: string;
      khz: string;
      channels: number;
    }
  | {
      type: "SET_VOLUME";
      volume: number;
    }
  | {
      type: "SET_BALANCE";
      balance: number;
    }
  | {
      type: "TOGGLE_REPEAT";
    }
  | {
      type: "TOGGLE_SHUFFLE";
    }
  | {
      type: "SET_FOCUS";
      input: string;
    }
  | {
      type: "SET_BAND_FOCUS";
      input: string;
      bandFocused: Band;
    }
  | {
      type: "UNSET_FOCUS";
    }
  | {
      type: "SET_SCRUB_POSITION";
      position: number;
    }
  | {
      type: "SET_USER_MESSAGE";
      message: string;
    }
  | {
      type: "UNSET_USER_MESSAGE";
    }
  | {
      type: "TOGGLE_DOUBLESIZE_MODE";
    }
  | {
      type: "TOGGLE_LLAMA_MODE";
    }
  | {
      type: "STEP_MARQUEE";
    }
  | {
      type: "DISABLE_MARQUEE";
    }
  | {
      type: "STOP_WORKING";
    }
  | {
      type: "START_WORKING";
    }
  | {
      type: "CLOSE_WINAMP";
    }
  | {
      type: "LOADING";
    }
  | {
      type: "LOADED";
    }
  | {
      type: "SET_SKIN_DATA";
      data: SkinData;
    }
  | {
      type: "TOGGLE_VISUALIZER_STYLE";
    }
  | {
      type: "REGISTER_VISUALIZER";
      id: string;
    }
  | {
      type: "SET_PLAYLIST_SCROLL_POSITION";
      position: number;
    }
  | {
      type: "SET_Z_INDEX";
      zIndex: number;
    }
  | {
      type: "SET_DUMMY_VIZ_DATA";
      data: null;
    }
  | {
      type: "SET_BAND_VALUE";
      band: Slider;
      value: number;
    }
  | {
      type: "SET_EQ_ON";
    }
  | {
      type: "SET_EQ_OFF";
    }
  | {
      type: "SET_EQ_AUTO";
      value: boolean;
    }
  | {
      type: "SET_FOCUSED_WINDOW";
      window: WindowId;
    }
  | {
      type: "TOGGLE_WINDOW_SHADE_MODE";
      windowId: WindowId;
    }
  | {
      type: "TOGGLE_WINDOW";
      windowId: WindowId;
    }
  | {
      type: "CLOSE_WINDOW";
      windowId: WindowId;
    }
  | {
      type: "SET_WINDOW_VISIBILITY";
      windowId: WindowId;
      hidden: boolean;
    }
  | {
      type: "ADD_GEN_WINDOW";
      windowId: WindowId;
      title: string;
      open: boolean;
    }
  | {
      type: "WINDOW_SIZE_CHANGED";
      windowId: WindowId;
      size: [number, number];
    }
  | {
      type: "UPDATE_WINDOW_POSITIONS";
      positions: WindowPositions;
    }
  | {
      type: "CLICKED_TRACK";
      index: number;
    }
  | {
      type: "CTRL_CLICKED_TRACK";
      index: number;
    }
  | {
      type: "SHIFT_CLICKED_TRACK";
      index: number;
    }
  | {
      type: "SELECT_ALL";
    }
  | {
      type: "SELECT_ZERO";
    }
  | {
      type: "INVERT_SELECTION";
    }
  | {
      type: "REMOVE_ALL_TRACKS";
    }
  | {
      type: "REMOVE_TRACKS";
      ids: string[];
    }
  | {
      type: "REVERSE_LIST";
    }
  | {
      type: "RANDOMIZE_LIST";
    }
  | {
      type: "SET_TRACK_ORDER";
      trackOrder: number[];
    }
  | {
      type: "SET_MEDIA_TAGS";
      id: number;
      title: string;
      artist: string;
      albumArtUrl: string;
    }
  | {
      type: "MEDIA_TAG_REQUEST_INITIALIZED";
      id: number;
    }
  | {
      type: "MEDIA_TAG_REQUEST_FAILED";
      id: number;
    }
  | {
      type: "SET_MEDIA_DURATION";
      id: number;
      duration: number;
    }
  | {
      type: "PLAY_TRACK";
      id: number;
    }
  | {
      type: "BUFFER_TRACK";
      id: number;
    }
  | {
      type: "DRAG_SELECTED";
      offset: number;
    }
  | {
      type: "PLAY";
    }
  | {
      type: "PAUSE";
    }
  | {
      type: "SEEK_TO_PERCENT_COMPLETE";
      percent: number;
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
  kbps: string | null;
  khz: string | null;
  volume: number;
  balance: number;
  channels: number | null; // TODO: Convert this to an enum
  shuffle: boolean;
  repeat: boolean;
  status: string | null; // TODO: Convert this to an enum
}

export interface UserInputState {
  focus: string | null; // TODO: Convert this to an enum?
  bandFocused: Band | null;
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
  zIndex: number;
  dummyVizData: null; // TODO: Figure out what kind of data this actually is.
}

export interface EqualizerState {
  on: boolean;
  auto: boolean;
  sliders: Record<Slider, number>;
}

export interface WebampWindow {
  title: string;
  size: [number, number];
  open: boolean;
  hidden: boolean;
  shade?: boolean;
  canResize: boolean;
  canShade: boolean;
  canDouble: boolean;
  generic: boolean;
  hotkey?: string;
}

export interface WindowInfo {
  key: WindowId;
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface WindowState {
  focused: string;
  genWindows: { [name: string]: WebampWindow };
  positions: WindowPositions;
}

export type MediaTagRequestStatus =
  | "INITIALIZED"
  | "FAILED"
  | "COMPLETE"
  | "NOT_REQUESTED";

export type MediaStatus = "PLAYING" | "STOPPED" | "PAUSED";

export interface PlaylistTrack {
  artist: string;
  title: string;
  url: string;
  defaultName: string;
  albumArtUrl: string | null;
  selected: boolean;
  mediaTagsRequestStatus: MediaTagRequestStatus;
  duration: number | null;
}

export interface PlaylistState {
  trackOrder: number[];
  // https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-263132208
  // TODO: Using numbers for keys is kinda annoying. Consider retyping as string
  tracks: { [id: number]: PlaylistTrack };
  lastSelectedIndex: number | null;
  currentTrack: number | null;
}

export interface AppState {
  userInput: UserInputState;
  windows: WindowState;
  display: DisplayState;
  settings: SettingsState;
  equalizer: EqualizerState;
  playlist: PlaylistState;
  media: MediaState;
  network: NetworkState;
}

export type GetState = () => AppState;

export type Thunk = (
  dispatch: Dispatch,
  getState: GetState
) => void | Promise<void>;

export type Dispatchable = Action | Thunk;

export type Dispatch = (action: Dispatchable) => void;

export interface MiddlewareStore {
  dispatch: Dispatch;
  getState: GetState;
}
