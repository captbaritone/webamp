import * as React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import {
  Store,
  AppState,
  Track,
  LoadedURLTrack,
  Middleware,
  ButterchurnOptions,
  PartialState,
  Options,
  MediaStatus,
} from "./types";
import getStore from "./store";
import App from "./components/App";
import { bindHotkeys } from "./hotkeys";
import Media from "./media";
import * as Selectors from "./selectors";
import * as Actions from "./actionCreators";

import { LOAD_STYLE } from "./constants";
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

import { SerializedStateV1 } from "./serializedStates/v1Types";
import Disposable from "./Disposable";

export interface PrivateOptions {
  requireJSZip(): Promise<any>; // TODO: Type JSZip
  requireMusicMetadata(): Promise<any>; // TODO: Type musicmetadata
  __initialState?: PartialState;
  __customMiddlewares?: Middleware[];
  __butterchurnOptions?: ButterchurnOptions;
  // This is used by https://winampify.io/ to proxy through to Spotify's API.
  __customMediaClass?: typeof Media; // This should have the same interface as Media
}

class Webamp {
  static VERSION = "1.5.0";
  _actionEmitter: Emitter;
  _root: ReactDOM.Root | null;
  _disposable: Disposable;
  options: Options & PrivateOptions; // TODO: Make this _private
  media: Media; // TODO: Make this _private
  store: Store; // TODO: Make this _private

  /**
   * Returns a true if the current browser supports the features that Webamp depends upon.
   *
   * It is recommended to check this before you attempt to instantiate an instance of Winamp.
   */
  static browserIsSupported(): boolean {
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
    this._root = null;
    this._disposable = new Disposable();
    this._actionEmitter = new Emitter();
    this.options = options;
    const {
      initialTracks,
      initialSkin,
      availableSkins,
      enableHotkeys = false,
      zIndex,
      requireJSZip,
      requireMusicMetadata,
      handleTrackDropEvent,
      handleAddUrlEvent,
      handleLoadListEvent,
      handleSaveListEvent,
      enableDoubleSizeMode,
      __butterchurnOptions,
      __customMediaClass,
    } = this.options;

    // TODO: Make this much cleaner
    let convertPreset = null;
    if (__butterchurnOptions != null) {
      const { importConvertPreset, presetConverterEndpoint } =
        __butterchurnOptions;

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

    if (enableDoubleSizeMode) {
      this.store.dispatch(Actions.toggleDoubleSizeMode());
    }

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

    // @ts-ignore
    if (options.avaliableSkins != null) {
      console.warn(
        "The misspelled option `avaliableSkins` is deprecated. Please use `availableSkins` instead."
      );
      // @ts-ignore
      this.store.dispatch({ type: SET_AVAILABLE_SKINS, skins: avaliableSkins });
    } else if (availableSkins != null) {
      this.store.dispatch({ type: SET_AVAILABLE_SKINS, skins: availableSkins });
    }

    this.store.dispatch(Actions.setWindowLayout(options.windowLayout));

    if (enableHotkeys) {
      this._disposable.add(bindHotkeys(this.store.dispatch));
    }
  }

  /**
   * Play the current tack
   */
  play(): void {
    this.store.dispatch(Actions.play());
  }

  /**
   * Pause the current tack
   */
  pause(): void {
    this.store.dispatch(Actions.pause());
  }

  /**
   * Stop the currently playing audio. Equivalent to pressing the "stop" button
   */
  stop(): void {
    this.store.dispatch(Actions.stop());
  }

  /**
   * Seek backward n seconds in the curent track
   */
  seekBackward(seconds: number) {
    this.store.dispatch(Actions.seekBackward(seconds));
  }

  /**
   * Seek forward n seconds in the curent track
   */
  seekForward(seconds: number) {
    this.store.dispatch(Actions.seekForward(seconds));
  }

  /**
   * Seek to a given time within the current track
   */
  seekToTime(seconds: number) {
    this.store.dispatch(Actions.seekToTime(seconds));
  }

  /**
   * Play the next track
   */
  nextTrack(): void {
    this.store.dispatch(Actions.next());
  }

  /**
   * Play the previous track
   */
  previousTrack(): void {
    this.store.dispatch(Actions.previous());
  }

  /**
   * Add an array of `Track`s to the end of the playlist.
   */
  appendTracks(tracks: Track[]): void {
    const nextIndex = Selectors.getTrackCount(this.store.getState());
    this.store.dispatch(
      Actions.loadMediaFiles(tracks, LOAD_STYLE.NONE, nextIndex)
    );
  }

  /**
   * Replace the playlist with an array of `Track`s and begin playing the first track.
   */
  setTracksToPlay(tracks: Track[]): void {
    this.store.dispatch(Actions.loadMediaFiles(tracks, LOAD_STYLE.PLAY));
  }

  /**
   * Get the current "playing" status.
   */
  getMediaStatus(): MediaStatus | null {
    return Selectors.getMediaStatus(this.store.getState());
  }

  /**
   * A callback which will be called when Webamp is _about to_ close. Returns an
   * "unsubscribe" function. The callback will be passed a `cancel` function
   * which you can use to conditionally prevent Webamp from being closed.
   *
   * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
   */
  onWillClose(cb: (cancel: () => void) => void): () => void {
    return this._actionEmitter.on(CLOSE_REQUESTED, (action) => {
      cb(action.cancel);
    });
  }

  /**
   * A callback which will be called when Webamp is closed.
   *
   * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
   */
  onClose(cb: () => void): () => void {
    return this._actionEmitter.on(CLOSE_WINAMP, cb);
  }

  /**
   * Equivalent to selection "Close" from Webamp's options menu. Once closed,
   * you can open it again with `.reopen()`.
   */
  close(): void {
    this.store.dispatch(Actions.close());
  }

  /**
   * After `.close()`ing this instance, you can reopen it by calling this method.
   */
  reopen(): void {
    this.store.dispatch(Actions.open());
  }

  /**
   * A callback which will be called when a new track starts loading.
   *
   * This can happen on startup when the first track starts buffering, or when a subsequent track starts playing.
   * The callback will be called with an object `({url: 'https://example.com/track.mp3'})` containing the URL of the track.
   * Note: If the user drags in a track, the URL may be an ObjectURL.
   *
   * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
   */
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

  /**
   * A callback which will be called when Webamp is minimized.
   *
   * @returns An "unsubscribe" function. Useful if at some point in the future you want to stop listening to these events.
   */
  onMinimize(cb: () => void): () => void {
    return this._actionEmitter.on(MINIMIZE_WINAMP, cb);
  }

  /**
   * Set the skin to use. This can be a URL or a base64 encoded string. The skin
   * will be loaded asynchronously.
   *
   * NOTE: If the URL is not on the same domain as the page, you will need to consider CORS.
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
   */
  setSkinFromUrl(url: string): void {
    this.store.dispatch(Actions.setSkinFromUrl(url));
    // TODO: Should this return a promise?
    // return this.skinIsLoaded(); ??
  }

  /**
   * Returns a promise that resolves when the skin is done loading.
   */
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

  /**
   * Webamp will wait until it has fetched the skin and fully parsed it and then render itself.
   *
   * Webamp is rendered into a new DOM node at the end of the <body> tag with the id `#webamp`.
   *
   * If a domNode is passed, Webamp will place itself in the center of that DOM node.
   *
   * @returns A promise is returned which will resolve after the render is complete.
   */
  async renderWhenReady(node: HTMLElement): Promise<void> {
    this.store.dispatch(Actions.centerWindowsInContainer(node));
    await this.skinIsLoaded();
    if (this._disposable.disposed) {
      return;
    }
    if (this._root != null) {
      throw new Error("Cannot render a Webamp instance twice");
    }
    this._root = ReactDOM.createRoot(node);
    this._disposable.add(() => {
      if (this._root != null) {
        this._root.unmount();
        this._root = null;
      }
    });

    this._root.render(
      <Provider store={this.store}>
        <App media={this.media} filePickers={this.options.filePickers || []} />
      </Provider>
    );
  }

  /**
   * **Note:** _This method is not fully functional. It is currently impossible to
   * clean up a Winamp instance. This method makes an effort, but it still leaks
   * the whole instance. In the future the behavior of this method will improve,
   * so you might as well call it._
   *
   * When you are done with a Webamp instance, call this method and Webamp will
   * attempt to clean itself up to avoid memory leaks.
   */
  dispose(): void {
    // TODO: Clean up store subscription in onTrackDidChange
    // TODO: Every storeHas call represents a potential race condition
    this.media.dispose();
    this._actionEmitter.dispose();
    this._disposable.dispose();
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

  _bufferTracks(tracks: Track[]): void {
    const nextIndex = Selectors.getTrackCount(this.store.getState());
    this.store.dispatch(
      Actions.loadMediaFiles(tracks, LOAD_STYLE.BUFFER, nextIndex)
    );
  }
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

// @ts-ignore
window.Webamp = Webamp;

export default Webamp;
