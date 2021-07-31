import * as React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import {
  Store,
  AppState,
  Track,
  LoadedURLTrack,
  Middleware,
  WindowPosition,
  ButterchurnOptions,
  Action,
} from "./types";
import getStore from "./store";
import App from "./components/App";
import { bindHotkeys } from "./hotkeys";
import Media from "./media";
import * as Selectors from "./selectors";
import * as Actions from "./actionCreators";

import { LOAD_STYLE } from "./constants";
import * as Utils from "./utils";
import * as FileUtils from "./fileUtils";

import {
  SET_AVAILABLE_SKINS,
  NETWORK_CONNECTED,
  NETWORK_DISCONNECTED,
  CLOSE_WINAMP,
  MINIMIZE_WINAMP,
  LOADED,
  SET_Z_INDEX,
  CLOSE_REQUESTED,
  ENABLE_MILKDROP,
} from "./actionTypes";
import Emitter from "./emitter";

import "../css/base-skin.css";
import { SerializedStateV1 } from "./serializedStates/v1Types";
import Disposable from "./Disposable";
import { DeepPartial } from "redux";

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
   * In the offical version, this option is used to provide a "Dropbox" file picker.
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
}

export type WindowLayout = {
  [windowId: string]: {
    size?: null | [number, number];
    position: WindowPosition;
  };
};

export interface PrivateOptions {
  avaliableSkins?: { url: string; name: string }[]; // Old misspelled name
  requireJSZip(): Promise<any>; // TODO: Type JSZip
  requireMusicMetadata(): Promise<any>; // TODO: Type musicmetadata
  __initialState?: DeepPartial<AppState>;
  __customMiddlewares?: Middleware[];
  __initialWindowLayout?: WindowLayout;
  __butterchurnOptions?: ButterchurnOptions;
  // This is used by https://winampify.io/ to proxy through to Spotify's API.
  __customMediaClass?: typeof Media; // This should have the same interface as Media
}

// Return a promise that resolves when the store matches a predicate.
// TODO #leak
const storeHas = (
  store: Store,
  predicate: (state: AppState) => boolean
): Promise<void> =>
  new Promise((resolve) => {
    if (predicate(store.getState())) {
      resolve();
      return;
    }
    const unsubscribe = store.subscribe(() => {
      if (predicate(store.getState())) {
        resolve();
        unsubscribe();
      }
    });
  });

class Webamp {
  static VERSION = "1.5.0";
  _actionEmitter: Emitter;
  _node: HTMLElement | null;
  _disposable: Disposable;
  options: Options & PrivateOptions; // TODO: Make this _private
  media: Media; // TODO: Make this _private
  store: Store; // TODO: Make this _private
  static browserIsSupported() {
    const supportsAudioApi = !!(
      window.AudioContext ||
      // @ts-ignore
      window.webkitAudioContext
    );
    const supportsCanvas = !!window.document.createElement("canvas").getContext;
    const supportsPromises = typeof Promise !== "undefined";
    return supportsAudioApi && supportsCanvas && supportsPromises;
  }

  constructor(options: Options & PrivateOptions) {
    this._node = null;
    this._disposable = new Disposable();
    this._actionEmitter = new Emitter();
    this.options = options;
    const {
      initialTracks,
      initialSkin,
      avaliableSkins, // Old misspelled name
      availableSkins,
      enableHotkeys = false,
      zIndex,
      requireJSZip,
      requireMusicMetadata,
      handleTrackDropEvent,
      handleAddUrlEvent,
      handleLoadListEvent,
      handleSaveListEvent,
      __butterchurnOptions,
      __customMediaClass,
    } = this.options;

    // TODO: Make this much cleaner
    let convertPreset = null;
    if (__butterchurnOptions != null) {
      const {
        importConvertPreset,
        presetConverterEndpoint,
      } = __butterchurnOptions;

      if (importConvertPreset != null && presetConverterEndpoint != null) {
        convertPreset = async (file: File): Promise<Object> => {
          const { convertPreset: convert } = await importConvertPreset();
          return convert(
            await FileUtils.genStringFromFileReference(file),
            presetConverterEndpoint
          );
        };
      }
    }

    // TODO: Validate required options

    this.media = new (__customMediaClass || Media)();
    this.store = getStore(
      this.media,
      this._actionEmitter,
      this.options.__customMiddlewares,
      this.options.__initialState,
      {
        requireJSZip,
        requireMusicMetadata,
        convertPreset,
        // @ts-ignore Typescript is drunk
        handleTrackDropEvent,
        handleAddUrlEvent,
        handleLoadListEvent,
        handleSaveListEvent,
      }
    ) as Store;

    if (navigator.onLine) {
      this.store.dispatch({ type: NETWORK_CONNECTED });
    } else {
      this.store.dispatch({ type: NETWORK_DISCONNECTED });
    }

    if (zIndex != null) {
      this.store.dispatch({ type: SET_Z_INDEX, zIndex });
    }

    if (options.__butterchurnOptions) {
      this.store.dispatch({
        type: ENABLE_MILKDROP,
        open: options.__butterchurnOptions.butterchurnOpen,
      });
      this.store.dispatch(
        Actions.initializePresets(options.__butterchurnOptions)
      );
    }

    const handleOnline = () => this.store.dispatch({ type: NETWORK_CONNECTED });
    const handleOffline = () =>
      this.store.dispatch({ type: NETWORK_DISCONNECTED });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    this._disposable.add(() => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    });

    if (initialSkin) {
      this.store.dispatch(Actions.setSkinFromUrl(initialSkin.url));
    } else {
      // We are using the default skin.
      this.store.dispatch({ type: LOADED });
    }

    if (initialTracks) {
      this._bufferTracks(initialTracks);
    }

    if (avaliableSkins != null) {
      console.warn(
        "The misspelled option `avaliableSkins` is deprecated. Please use `availableSkins` instead."
      );
      this.store.dispatch({ type: SET_AVAILABLE_SKINS, skins: avaliableSkins });
    } else if (availableSkins != null) {
      this.store.dispatch({ type: SET_AVAILABLE_SKINS, skins: availableSkins });
    }

    const layout = options.__initialWindowLayout;
    if (layout == null) {
      this.store.dispatch(Actions.stackWindows());
    } else {
      Utils.objectForEach(layout, (w, windowId) => {
        if (w.size != null) {
          this.store.dispatch(Actions.setWindowSize(windowId, w.size));
        }
      });
      this.store.dispatch(
        Actions.updateWindowPositions(
          Utils.objectMap(layout, (w) => w.position),
          false
        )
      );
    }

    if (enableHotkeys) {
      this._disposable.add(bindHotkeys(this.store.dispatch));
    }
  }

  play() {
    this.store.dispatch(Actions.play());
  }

  pause() {
    this.store.dispatch(Actions.pause());
  }

  stop() {
    this.store.dispatch(Actions.stop());
  }

  seekBackward(seconds: number) {
    this.store.dispatch(Actions.seekBackward(seconds));
  }

  seekForward(seconds: number) {
    this.store.dispatch(Actions.seekForward(seconds));
  }

  seekToTime(seconds: number) {
    this.store.dispatch(Actions.seekToTime(seconds));
  }

  nextTrack() {
    this.store.dispatch(Actions.next());
  }

  previousTrack() {
    this.store.dispatch(Actions.previous());
  }

  _bufferTracks(tracks: Track[]): void {
    const nextIndex = Selectors.getTrackCount(this.store.getState());
    this.store.dispatch(
      Actions.loadMediaFiles(tracks, LOAD_STYLE.BUFFER, nextIndex)
    );
  }

  // Append this array of tracks to the end of the current playlist.
  appendTracks(tracks: Track[]): void {
    const nextIndex = Selectors.getTrackCount(this.store.getState());
    this.store.dispatch(
      Actions.loadMediaFiles(tracks, LOAD_STYLE.NONE, nextIndex)
    );
  }

  // Replace any existing tracks with this array of tracks, and begin playing.
  setTracksToPlay(tracks: Track[]): void {
    this.store.dispatch(Actions.loadMediaFiles(tracks, LOAD_STYLE.PLAY));
  }

  getMediaStatus() {
    return Selectors.getMediaStatus(this.store.getState());
  }

  onWillClose(cb: (cancel: () => void) => void): () => void {
    return this._actionEmitter.on(CLOSE_REQUESTED, (action) => {
      cb(action.cancel);
    });
  }

  onClose(cb: () => void): () => void {
    return this._actionEmitter.on(CLOSE_WINAMP, cb);
  }

  close(): void {
    this.store.dispatch(Actions.close());
  }

  reopen(): void {
    this.store.dispatch(Actions.open());
  }

  onTrackDidChange(cb: (trackInfo: LoadedURLTrack | null) => void): () => void {
    let previousTrackId: number | null = null;
    // TODO #leak
    return this.store.subscribe(() => {
      const state = this.store.getState();
      const trackId = Selectors.getCurrentlyPlayingTrackIdIfLoaded(state);
      if (trackId === previousTrackId) {
        return;
      }
      previousTrackId = trackId;
      cb(trackId == null ? null : Selectors.getCurrentTrackInfo(state));
    });
  }

  onMinimize(cb: () => void): () => void {
    return this._actionEmitter.on(MINIMIZE_WINAMP, cb);
  }

  setSkinFromUrl(url: string): void {
    this.store.dispatch(Actions.setSkinFromUrl(url));
  }

  async skinIsLoaded(): Promise<void> {
    // Wait for the skin to load.
    // TODO #leak
    await storeHas(this.store, (state) => !state.display.loading);
    // We attempt to pre-resolve these promises before we declare the skin
    // loaded. That's because `<EqGraph>` needs these in order to render fully.
    // As long as these are resolved before we attempt to render, we can ensure
    // that we will have all the data we need on first paint.
    //
    // Note: This won't help for non-initial skin loads.
    await Promise.all([
      Selectors.getPreampLineImage(this.store.getState()),
      Selectors.getLineColorsImage(this.store.getState()),
    ]);
    return;
  }

  __loadSerializedState(serializedState: SerializedStateV1): void {
    this.store.dispatch(Actions.loadSerializedState(serializedState));
  }

  __getSerializedState() {
    return Selectors.getSerlializedState(this.store.getState());
  }

  __onStateChange(cb: () => void): () => void {
    // TODO #leak
    return this.store.subscribe(cb);
  }

  async renderWhenReady(node: HTMLElement): Promise<void> {
    this.store.dispatch(Actions.centerWindowsInContainer(node));
    await this.skinIsLoaded();
    // TODO #race We may have been destroyed
    if (this._node != null) {
      throw new Error("Cannot render a Webamp instance twice");
    }
    this._node = node;
    this._disposable.add(() => {
      if (this._node != null) {
        ReactDOM.unmountComponentAtNode(this._node);
        this._node = null;
      }
    });

    ReactDOM.render(
      <Provider<Action> store={this.store}>
        <App media={this.media} filePickers={this.options.filePickers || []} />
      </Provider>,
      node
    );
  }

  dispose(): void {
    // TODO: Clean up store subscription in onTrackDidChange
    // TODO: Every storeHas call represents a potential race condition
    this.media.dispose();
    this._actionEmitter.dispose();
    this._disposable.dispose();
  }
}

export default Webamp;
