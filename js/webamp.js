import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import getStore from "./store";
import App from "./components/App";
import Hotkeys from "./hotkeys";
import Media from "./media";
import { getTrackCount } from "./selectors";
import {
  setSkinFromUrl,
  loadMediaFiles,
  setWindowSize
} from "./actionCreators";
import { LOAD_STYLE } from "./constants";
import { uniqueId, objectMap, objectForEach } from "./utils";

import {
  SET_AVAILABLE_SKINS,
  NETWORK_CONNECTED,
  NETWORK_DISCONNECTED,
  CLOSE_WINAMP,
  MINIMIZE_WINAMP,
  ADD_GEN_WINDOW,
  UPDATE_WINDOW_POSITIONS
} from "./actionTypes";
import Emitter from "./emitter";

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
    this._actionEmitter = new Emitter();
    this.options = options;
    const {
      initialTracks,
      avaliableSkins, // Old misspelled name
      availableSkins,
      enableHotkeys = false,
      __extraWindows
    } = this.options;

    this.media = new Media();
    this.store = getStore(
      this.media,
      this._actionEmitter,
      this.options.__customMiddlewares,
      this.options.__initialState
    );
    this.store.dispatch({
      type: navigator.onLine ? NETWORK_CONNECTED : NETWORK_DISCONNECTED
    });

    this.genWindows = [];
    if (__extraWindows) {
      this.genWindows = __extraWindows.map(genWindow => ({
        id: genWindow.id || `${genWindow.title}-${uniqueId()}`,
        ...genWindow
      }));
    }

    this.genWindows.forEach(genWindow => {
      this.store.dispatch({
        type: ADD_GEN_WINDOW,
        windowId: genWindow.id,
        title: genWindow.title
      });
    });

    window.addEventListener("online", () =>
      this.store.dispatch({ type: NETWORK_CONNECTED })
    );
    window.addEventListener("offline", () =>
      this.store.dispatch({ type: NETWORK_DISCONNECTED })
    );

    //this.store.dispatch(setSkinFromUrl(this.options.initialSkin.url));

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
    if (layout != null) {
      objectForEach(layout, (w, windowId) => {
        if (w.size != null) {
          this.store.dispatch(setWindowSize(windowId, w.size));
        }
      });
      this.store.dispatch({
        type: UPDATE_WINDOW_POSITIONS,
        positions: objectMap(layout, w => w.position)
      });
    }

    if (enableHotkeys) {
      new Hotkeys(this.store.dispatch);
    }
  }

  // Append this array of tracks to the end of the current playlist.
  appendTracks(tracks) {
    const nextIndex = getTrackCount(this.store.getState());
    this.store.dispatch(loadMediaFiles(tracks, LOAD_STYLE.BUFFER, nextIndex));
  }

  // Replace any existing tracks with this array of tracks, and begin playing.
  setTracksToPlay(tracks) {
    this.store.dispatch(loadMediaFiles(tracks, LOAD_STYLE.PLAY));
  }

  onClose(cb) {
    return this._actionEmitter.on(CLOSE_WINAMP, cb);
  }

  onMinimize(cb) {
    return this._actionEmitter.on(MINIMIZE_WINAMP, cb);
  }

  async renderWhenReady(node) {
    // Wait for the skin to load.
    //await storeHas(this.store, state => !state.display.loading);

    const genWindowComponents = {};
    this.genWindows.forEach(w => {
      genWindowComponents[w.id] = w.Component;
    });

    render(
      <Provider store={this.store}>
        <App
          media={this.media}
          container={this.options.container}
          filePickers={this.options.filePickers}
          genWindowComponents={genWindowComponents}
        />
      </Provider>,
      node
    );
  }
}

export default Winamp;
module.exports = Winamp;
