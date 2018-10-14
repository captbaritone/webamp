import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import getStore from "./store";
import App from "./components/App";
import { bindHotkeys } from "./hotkeys";
import Media from "./media";
import * as Selectors from "./selectors";
import * as Actions from "./actionCreators";

import { LOAD_STYLE } from "./constants";
import * as Utils from "./utils";

import {
  SET_AVAILABLE_SKINS,
  NETWORK_CONNECTED,
  NETWORK_DISCONNECTED,
  CLOSE_WINAMP,
  MINIMIZE_WINAMP,
  ADD_GEN_WINDOW,
  LOADED,
  REGISTER_VISUALIZER,
  SET_Z_INDEX,
  CLOSE_REQUESTED,
  ENABLE_MEDIA_LIBRARY
} from "./actionTypes";
import Emitter from "./emitter";

import "../css/base-skin.min.css";

// Return a promise that resolves when the store matches a predicate.
const storeHas = (store, predicate) =>
  new Promise(resolve => {
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

class Winamp {
  static browserIsSupported() {
    const supportsAudioApi = !!(
      window.AudioContext || window.webkitAudioContext
    );
    const supportsCanvas = !!window.document.createElement("canvas").getContext;
    const supportsPromises = typeof Promise !== "undefined";
    return supportsAudioApi && supportsCanvas && supportsPromises;
  }

  constructor(options) {
    this._subscriptions = [];
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
      requireJSMediaTags,
      __extraWindows
    } = this.options;

    // TODO: Validate required options

    this.media = new Media();
    this.store = getStore(
      this.media,
      this._actionEmitter,
      this.options.__customMiddlewares,
      this.options.__initialState,
      { requireJSZip, requireJSMediaTags }
    );
    this.store.dispatch({
      type: navigator.onLine ? NETWORK_CONNECTED : NETWORK_DISCONNECTED
    });

    if (zIndex != null) {
      this.store.dispatch({ type: SET_Z_INDEX, zIndex });
    }

    this.genWindows = [];
    if (__extraWindows) {
      this.genWindows = __extraWindows.map(genWindow => ({
        id: genWindow.id || `${genWindow.title}-${Utils.uniqueId()}`,
        ...genWindow
      }));

      __extraWindows.forEach(genWindow => {
        if (genWindow.isVisualizer) {
          this.store.dispatch({ type: REGISTER_VISUALIZER, id: genWindow.id });
        }
      });
    }

    this.genWindows.forEach(genWindow => {
      this.store.dispatch({
        type: ADD_GEN_WINDOW,
        windowId: genWindow.id,
        title: genWindow.title,
        open: genWindow.open
      });
    });

    if (options.__enableMediaLibrary) {
      this.store.dispatch({ type: ENABLE_MEDIA_LIBRARY });
    }

    window.addEventListener("online", () =>
      this.store.dispatch({ type: NETWORK_CONNECTED })
    );
    window.addEventListener("offline", () =>
      this.store.dispatch({ type: NETWORK_DISCONNECTED })
    );

    if (initialSkin) {
      this.store.dispatch(Actions.setSkinFromUrl(initialSkin.url));
    } else {
      // We are using the default skin.
      this.store.dispatch({ type: LOADED });
    }

    if (initialTracks) {
      this.appendTracks(initialTracks);
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
          Utils.objectMap(layout, w => w.position),
          false
        )
      );
    }

    if (enableHotkeys) {
      this._subscriptions.push(bindHotkeys(this.store.dispatch));
    }
  }

  play() {
    this.store.dispatch(Actions.play());
  }

  pause() {
    this.store.dispatch(Actions.pause());
  }

  seekBackward(seconds) {
    this.store.dispatch(Actions.seekBackward(seconds));
  }

  seekForward(seconds) {
    this.store.dispatch(Actions.seekForward(seconds));
  }

  nextTrack() {
    this.store.dispatch(Actions.next());
  }

  previousTrack() {
    this.store.dispatch(Actions.previous());
  }

  // Append this array of tracks to the end of the current playlist.
  appendTracks(tracks) {
    const nextIndex = Selectors.getTrackCount(this.store.getState());
    this.store.dispatch(
      Actions.loadMediaFiles(tracks, LOAD_STYLE.BUFFER, nextIndex)
    );
  }

  // Replace any existing tracks with this array of tracks, and begin playing.
  setTracksToPlay(tracks) {
    this.store.dispatch(Actions.loadMediaFiles(tracks, LOAD_STYLE.PLAY));
  }

  onWillClose(cb) {
    return this._actionEmitter.on(CLOSE_REQUESTED, action => {
      cb(action.cancel);
    });
  }

  onClose(cb) {
    return this._actionEmitter.on(CLOSE_WINAMP, cb);
  }

  onTrackDidChange(cb) {
    let previousTrackId = null;
    this.store.subscribe(() => {
      const state = this.store.getState();
      const trackId = Selectors.getCurrentlyPlayingTrackIdIfLoaded(state);
      if (trackId === previousTrackId) {
        return;
      }
      previousTrackId = trackId;
      cb(trackId == null ? null : Selectors.getCurrentTrackInfo(state));
    });
  }

  onMinimize(cb) {
    return this._actionEmitter.on(MINIMIZE_WINAMP, cb);
  }

  async skinIsLoaded() {
    // Wait for the skin to load.
    return storeHas(this.store, state => !state.display.loading);
  }

  __loadSerializedState(serializedState) {
    this.store.dispatch(Actions.loadSerializedState(serializedState));
  }

  __getSerializedState() {
    return Selectors.getSerlializedState(this.store.getState());
  }

  __onStateChange(cb) {
    return this.store.subscribe(cb);
  }

  async renderWhenReady(node) {
    this.store.dispatch(Actions.centerWindowsInContainer(node));
    await this.skinIsLoaded();
    const genWindowComponents = {};
    this.genWindows.forEach(w => {
      genWindowComponents[w.id] = w.Component;
    });

    render(
      <Provider store={this.store}>
        <App
          media={this.media}
          container={node}
          filePickers={this.options.filePickers}
          genWindowComponents={genWindowComponents}
        />
      </Provider>,
      node
    );
  }

  destroy() {
    // TODO: Clean up event emitter subscriptions
    // TODO: Clean up hotkey bindings, if needed
    // TODO: Clean up the Media instance
    // TODO: Clean up online/offline subscriptions on window
    // TODO: Clean up store subscription in onTrackDidChange
    // TODO: Every storeHas call represents a potential race condition
    throw new Error("Not implemented");
  }
}

export default Winamp;
