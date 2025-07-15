import type { AnyWebByteStream, IFileInfo } from "strtok3";
import { PlaylistState } from "./reducers/playlist";
import { SettingsState } from "./reducers/settings";
import { UserInputState } from "./reducers/userInput";
import { MediaState } from "./reducers/media";
import { ThunkDispatch, ThunkAction } from "redux-thunk";
import { DisplayState } from "./reducers/display";
import {
  WindowsState,
  WindowPositions as _WindowPositions,
  WebampWindow as _WebampWindow,
  WindowInfo as _WindowInfo,
} from "./reducers/windows";
import { EqualizerState } from "./reducers/equalizer";
import { NetworkState } from "./reducers/network";
import { MilkdropState } from "./reducers/milkdrop";
import { SerializedStateV1 } from "./serializedStates/v1Types";
import { TracksState } from "./reducers/tracks";
import { IAudioMetadata, IOptions } from "music-metadata-browser";
import { Store as ReduxStore } from "redux";

// Avoid warnings from Webpack: https://github.com/webpack/webpack/issues/7378
export type WebampWindow = _WebampWindow;
export type WindowInfo = _WindowInfo;
export type WindowPositions = _WindowPositions;

export interface Point {
  x: number;
  y: number;
}

export interface Diff {
  x?: number;
  y?: number;
}

export interface BoundingBox {
  width: number;
  height: number;
}

export interface Box extends Point {
  width: number;
  height: number;
}

export interface FilePicker {
  contextMenuName: string;
  filePicker: () => Promise<Track[]>;
  requiresNetwork: boolean;
}

export type Skin = {
  url: string;
  name: string;
};

export interface MilkdropMessage {
  text: string;
  time: number;
}

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

export type Slider = Band | "preamp";

export type CursorImage =
  | {
      type: "cur";
      url: string;
    }
  | {
      type: "ani";
      aniData: Uint8Array;
    };

// TODO: Use a type to ensure these keys mirror the CURSORS constant in
// skinParser.js
export type Cursors = { [cursor: string]: CursorImage };

export type GenLetterWidths = { [letter: string]: number };

export interface PlaylistStyle {
  normal: string;
  current: string;
  normalbg: string;
  selectedbg: string;
  font: string;
}

// TODO: Type these keys.
export type SkinImages = { [sprite: string]: string };

// TODO: type these keys
export type SkinRegion = { [windowName: string]: string[] };

export type DummyVizData = {
  0: 11.75;
  8: 11.0625;
  16: 8.5;
  24: 7.3125;
  32: 6.75;
  40: 6.4375;
  48: 6.25;
  56: 5.875;
  64: 5.625;
  72: 5.25;
  80: 5.125;
  88: 4.875;
  96: 4.8125;
  104: 4.375;
  112: 3.625;
  120: 1.5625;
};

export interface SkinGenExColors {
  itemBackground: string;
  itemForeground: string;
  windowBackground: string;
  buttonText: string;
  windowText: string;
  divider: string;
  playlistSelection: string;
  listHeaderBackground: string;
  listHeaderText: string;
  listHeaderFrameTopAndLeft: string;
  listHeaderFrameBottomAndRight: string;
  listHeaderFramePressed: string;
  listHeaderDeadArea: string;
  scrollbarOne: string;
  scrollbarTwo: string;
  pressedScrollbarOne: string;
  pressedScrollbarTwo: string;
  scrollbarDeadArea: string;
  listTextHighlighted: string;
  listTextHighlightedBackground: string;
  listTextSelected: string;
  listTextSelectedBackground: string;
}

export type WindowId = "main" | "playlist" | "equalizer" | "milkdrop";

// TODO: Fill these out once we actually use them.
export type SkinData = {
  skinImages: SkinImages;
  skinColors: string[];
  skinPlaylistStyle: PlaylistStyle;
  skinCursors: Cursors;
  skinRegion: SkinRegion;
  skinGenLetterWidths: GenLetterWidths;
  skinGenExColors: SkinGenExColors | null;
};

// This is what we actually pass to butterchurn
export type ButterchurnPresetJson = {
  name: string;
  butterchurnPresetObject: Object;
};

// A URL that points to a Butterchurn preset
export interface ButterchurnPresetUrl {
  name: string;
  butterchurnPresetUrl: string;
}

export type LazyButterchurnPresetJson = {
  name: string;
  getButterchrunPresetObject: () => Promise<Object>;
};

export type Preset =
  | ButterchurnPresetJson
  | ButterchurnPresetUrl
  | LazyButterchurnPresetJson;

export type StatePreset =
  | { type: "RESOLVED"; name: string; preset: Object }
  | { type: "UNRESOLVED"; name: string; getPreset: () => Promise<Object> };

export interface ButterchurnOptions {
  getPresets(): Promise<Preset[]>;
  importButterchurn(): Promise<any>;
  importConvertPreset?: () => Promise<{
    convertPreset(file: string, endpoint: string): Promise<Object>;
  }>;
  presetConverterEndpoint?: string;
  butterchurnOpen: boolean;
}

export interface EqfPreset {
  name: string;
  hz60: number;
  hz170: number;
  hz310: number;
  hz600: number;
  hz1000: number;
  hz3000: number;
  hz12000: number;
  hz14000: number;
  hz16000: number;
  hz6000: number;
  preamp: number;
}

export enum TransitionType {
  IMMEDIATE,
  DEFAULT,
  USER_PRESET,
}

export interface Size {
  width: number;
  height: number;
}

export type Action =
  | {
      type: "@@init";
    }
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
      type: "TOGGLE_TIME_MODE";
    }
  | {
      type: "UPDATE_TIME_ELAPSED";
      elapsed: number;
    }
  | {
      type: "ADD_TRACK_FROM_URL";
      atIndex: number | null;
      id: number;
      defaultName?: string;
      duration?: number;
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
      bandFocused: Slider;
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
      type: "OPEN_WINAMP";
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
      type: "SET_PLAYLIST_SCROLL_POSITION";
      position: number;
    }
  | {
      type: "SET_Z_INDEX";
      zIndex: number;
    }
  | {
      type: "SET_DUMMY_VIZ_DATA";
      data: DummyVizData;
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
      window: WindowId | null;
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
      absolute?: boolean;
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
      ids: number[];
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
      album?: string;
      albumArtUrl?: string | null;
      numberOfChannels?: number;
      bitrate?: number;
      sampleRate?: number;
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
    }
  | {
      type: "MINIMIZE_WINAMP";
    }
  | {
      type: "CLOSE_REQUESTED";
      cancel: () => void;
    }
  | {
      type: "LOAD_SERIALIZED_STATE";
      serializedState: SerializedStateV1;
    }
  | { type: "RESET_WINDOW_SIZES" }
  | { type: "BROWSER_WINDOW_SIZE_CHANGED"; height: number; width: number }
  | { type: "LOAD_DEFAULT_SKIN" }
  | { type: "ENABLE_MILKDROP"; open: boolean }
  | { type: "SCHEDULE_MILKDROP_MESSAGE"; message: string }
  | {
      type: "SET_MILKDROP_DESKTOP";
      enabled: boolean;
    }
  | {
      type: "SET_MILKDROP_FULLSCREEN";
      enabled: boolean;
    }
  | { type: "PRESET_REQUESTED"; index: number; addToHistory: boolean }
  | {
      type: "GOT_BUTTERCHURN_PRESETS";
      presets: StatePreset[];
    }
  | {
      type: "GOT_BUTTERCHURN";
      butterchurn: any;
    }
  | {
      type: "TOGGLE_RANDOMIZE_PRESETS";
    }
  | { type: "TOGGLE_PRESET_CYCLING" }
  | {
      type: "RESOLVE_PRESET_AT_INDEX";
      index: number;
      json: Object;
    }
  | {
      type: "SELECT_PRESET_AT_INDEX";
      index: number;
      transitionType: TransitionType;
    }
  | { type: "TOGGLE_PRESET_OVERLAY" }
  | { type: "MAIN_CONTEXT_MENU_OPENED" }
  | {
      type: "DROPPED_FILES";
      count: number;
      firstFileName: string | null;
      windowId: WindowId;
    }
  | {
      type: "OPENED_FILES";
      expectedType: "SKIN" | "MEDIA" | "EQ";
      count: number;
      firstFileName: string | null;
    };

export type MediaTagRequestStatus =
  | "INITIALIZED"
  | "FAILED"
  | "COMPLETE"
  | "NOT_REQUESTED";

/** The status of the current media. */
export type MediaStatus = "PLAYING" | "STOPPED" | "PAUSED";

/**
 * The media status of the player. Similar to MediaStatus but can discriminate
 * between different reasons for being stopped.
 */
export type PlayerMediaStatus =
  | "PLAYING"
  | "STOPPED"
  | "PAUSED"
  /** We have reached the end of the playlist. */
  | "ENDED"
  /** The player is closed. */
  | "CLOSED";

export type LoadStyle = "BUFFER" | "PLAY" | "NONE";

export type TimeMode = "ELAPSED" | "REMAINING";

interface TrackInfo {
  /**
   * Name to be used until ID3 tags can be resolved.
   *
   * If the track has a `url`, and this property is not given,
   * the filename will be used instead.
   *
   * Example: `'My Song'`
   */
  defaultName?: string;

  /**
   * Data to be used _instead_ of trying to fetch ID3 tags.
   *
   * Example: `{ artist: 'Jordan Eldredge', title: "Jordan's Song" }`
   */
  metaData?: {
    artist: string;
    title: string;
    album?: string;
    albumArtUrl?: string;
  };

  /**
   * Duration (in seconds) to be used instead of fetching enough of the file to measure its length.
   *
   * Example: 95
   */
  duration?: number;
}

export interface URLTrack extends TrackInfo {
  /**
   * Source URL of the track
   *
   * Note: This URL must be served the with correct CORs headers.
   *
   * Example: `'https://example.com/song.mp3'`
   */
  url: string;
}

export interface BlobTrack extends TrackInfo {
  /**
   * Blob source of the track
   */
  blob: Blob;
}

export interface LoadedURLTrack {
  url: string;
  metaData: {
    artist: string | null;
    title: string | null;
    album: string | null;
    albumArtUrl: string | null;
  };
}

export interface Options {
  /**
   * An object representing the initial skin to use.
   *
   * If omitted, the default skin, included in the bundle, will be used.
   * Note: This URL must be served the with correct CORs headers.
   *
   * Example: `{ url: './path/to/skin.wsz' }`
   */
  initialSkin?: {
    url: string;
  };

  /**
   * An array of `Track`s to prepopulate the playlist with.
   */
  initialTracks?: Track[];

  /**
   * An array of objects representing available skins.
   *
   * These will appear in the "Options" menu under "Skins".
   * Note: These URLs must be served with the correct CORs headers.
   *
   * Example: `[ { url: "./green.wsz", name: "Green Dimension V2" } ]`
   */
  availableSkins?: { url: string; name: string }[];

  /**
   * Configure how the Winamp windows should be laid out on initial render.
   */
  windowLayout?: WindowLayout;

  /**
   * Controls if "double size mode", where the fixed sized windows are rendered
   * at 2x, should be enabled
   *
   *  **Note:** In keeping with the original Winamp, double size mode does not
   *  apply to resizable windows like the equalizer or Milkdrop.
   *
   * Default: `false`
   */
  enableDoubleSizeMode?: boolean;

  /**
   * Should global hotkeys be enabled?
   *
   * Default: `false`
   */
  enableHotkeys?: boolean;

  /**
   * An array of additional file pickers.
   *
   * These will appear in the "Options" menu under "Play".
   *
   * For example, this option can be used to provide a "Dropbox" file picker.
   */
  filePickers?: [
    {
      /**
       * The name that will appear in the context menu.
       *
       * Example: `"My File Picker..."`
       */
      contextMenuName: string;

      /**
       * A function which returns a Promise that resolves to an array of `Track`s
       *
       * Example: `() => Promise.resolve([{ url: './rick_roll.mp3' }])`
       */
      filePicker: () => Promise<Track[]>;

      /**
       * Indicates if this options should be made available when the user is offline.
       */
      requiresNetwork: boolean;
    }
  ];
  zIndex?: number;
  handleTrackDropEvent?: (
    e: React.DragEvent<HTMLDivElement>
  ) => Track[] | null | Promise<Track[] | null>;
  handleAddUrlEvent?: () => Track[] | null | Promise<Track[] | null>;
  handleLoadListEvent?: () => Track[] | null | Promise<Track[] | null>;
  handleSaveListEvent?: (tracks: Track[]) => null | Promise<null>;

  /**
   * Have Webamp attempt to connect to the browser's media session API.
   *
   * This allows OS/hardware level media controls like play/pause/next/previous
   * and lock screen "current track" information to work with Webamp.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
   */
  enableMediaSession?: boolean;

  /**
   * Milkdrop (Butterchurn) presets to be used. If not specified, the default presets
   * included in the bundle will be used.
   *
   * Presets are expected to be in Butterchurn's JSON format. You can find these
   * `.json` files in:
   *
   * * The [Milkdrop Presets Collection](https://archive.org/details/milkdrops) at the Internet Archive.
   * * The `butterchurn-presets@3.0.0-beta.4` NPM package
   */
  requireButterchurnPresets?: () => Promise<Preset[]>;
}

/**
 * Specifies the initial position and size of a the Winamp windows.
 *
 * Positions are specified in pixels from the top left corner of an imaginary
 * box. On initial render, the collection of visible windows will be centered
 * within the HTML element passed to `Webamp.renderWhenReady(element)`. In other
 * words, the positions given here will determine the _relative_ position of the
 * windows. The absolute position will be determined by the HTML element in
 * which Webamp is centered.
 *
 * Enabling "shade mode" for a window that supports it, will cause it to be
 * rendered minimized. Be default windows are not in shade mode.
 *
 * Windows which support resizing can have their size specified. If omitted,
 * they default to their small base size.
 *
 * Windows that are omitted will start closed. Enabling "closed" for a window
 * that supports it, will cause it to start closed.
 */
export type WindowLayout = {
  main?: {
    position: WindowPosition;
    shadeMode?: boolean;
    closed?: boolean;
  };
  equalizer?: {
    position: WindowPosition;
    shadeMode?: boolean;
    closed?: boolean;
  };
  playlist?: {
    position: WindowPosition;
    shadeMode?: boolean;
    size?: WindowSize | null;
    closed?: boolean;
  };
  milkdrop?: {
    position: WindowPosition;
    size?: WindowSize | null;
    closed?: boolean;
  };
};

/**
 * Offset from the top left corner of an imaginary box.
 */
export type WindowPosition = { top: number; left: number };

/**
 * Resizable windows in Winamp have a base size and can be expanded in
 * increments based on the size of the skin sprite.
 *
 * To specify a window being larger than its base size, use `extraHeight` to
 * specify how many sprite increments to expand the window's height by, and
 * `extraWidth` to specify how many sprite increments to expand the window's
 * width by.
 */
export type WindowSize = {
  extraHeight: number;
  extraWidth: number;
};

/**
 * Many methods on the webamp instance deal with track.
 *
 * Either `url` or `blob` must be specified
 */
export type Track = URLTrack | BlobTrack;

export interface PlaylistTrack {
  id: number;
  artist?: string;
  title?: string;
  album?: string;
  url: string;
  defaultName: string | null;
  albumArtUrl?: string | null;
  mediaTagsRequestStatus: MediaTagRequestStatus;
  duration: number | null;
  kbps?: string;
  khz: string;
  channels?: number;
}

export interface AppState {
  userInput: UserInputState;
  windows: WindowsState;
  display: DisplayState;
  settings: SettingsState;
  equalizer: EqualizerState;
  playlist: PlaylistState;
  media: MediaState;
  network: NetworkState;
  tracks: TracksState;
  milkdrop: MilkdropState;
}

export type PartialState = any;

/**
 * Type definition of the music-metadata-browser module.
 * Ref: https://github.com/Borewit/music-metadata-browser/blob/master/src/index.ts
 */
export interface IMusicMetadataBrowserApi {
  /**
   * Parse Web API File
   * @param {Blob} blob
   * @param {IOptions} options Parsing options
   * @returns {Promise<IAudioMetadata>}
   */
  parseBlob(blob: Blob, options?: IOptions): Promise<IAudioMetadata>;

  /**
   * Parse fetched file, using the Web Fetch API
   * @param {string} audioTrackUrl URL to download the audio track from
   * @param {IOptions} options Parsing options
   * @returns {Promise<IAudioMetadata>}
   */
  fetchFromUrl(
    audioTrackUrl: string,
    options?: IOptions
  ): Promise<IAudioMetadata>;
}

/**
 * Type definition of the portion of the music-metadata module we use in Webamp.
 */
export interface IMusicMetadataApi {
  /**
   * Parse audio from Node Stream.Readable
   * @param stream - Stream to read the audio track from
   * @param fileInfo - File information object or MIME-type, e.g.: 'audio/mpeg'
   * @param options - Parsing options
   * @returns Metadata
   */
  parseWebStream(
    webStream: AnyWebByteStream,
    fileInfo?: IFileInfo | string,
    options?: IOptions
  ): Promise<IAudioMetadata>;

  /**
   * Parse Web API File
   * @param {Blob} blob
   * @param {IOptions} options Parsing options
   * @returns {Promise<IAudioMetadata>}
   */
  parseBlob(blob: Blob, options?: IOptions): Promise<IAudioMetadata>;
}

export type IMetadataApi = IMusicMetadataBrowserApi | IMusicMetadataApi;

export interface Extras {
  requireJSZip(): Promise<any>;
  requireMusicMetadata(): Promise<IMetadataApi>;
  convertPreset: ((file: File) => Promise<Object>) | null;
  handleTrackDropEvent?: (
    e: React.DragEvent<HTMLDivElement>
  ) => Track[] | null | Promise<Track[] | null>;
  handleAddUrlEvent?: () => Track[] | null | Promise<Track[] | null>;
  handleLoadListEvent?: () => Track[] | null | Promise<Track[] | null>;
  handleSaveListEvent?: (tracks: Track[]) => null | Promise<null>;
}

export type GetState = () => AppState;

export type Thunk = ThunkAction<void, AppState, Extras, Action>;

export type Dispatch = ThunkDispatch<AppState, Extras, Action>;

export type Reducer = (state: AppState, action: Action) => AppState;

export type Middleware = (
  store: MiddlewareStore
) => (next: Dispatch) => (action: Action) => any;

export interface Store extends ReduxStore {
  subscribe(cb: () => void): () => void;
  dispatch: Dispatch;
  getState: GetState;
}

export interface MiddlewareStore {
  dispatch: Dispatch;
  getState: GetState;
}
