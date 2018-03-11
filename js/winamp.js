import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import getStore from "./store";
import App from "./components/App";
import Hotkeys from "./hotkeys";
import Media from "./media";
import { setSkinFromUrl, loadMediaFiles } from "./actionCreators";
import { LOAD_STYLE } from "./constants";

import { SET_AVALIABLE_SKINS } from "./actionTypes";

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
    this.options = options;
    const {
      initialTracks,
      avaliableSkins,
      enableHotkeys = false
    } = this.options;

    this.media = new Media();
    this.store = getStore(this.media, this.options.__initialState);

    this.store.dispatch(setSkinFromUrl(this.options.initialSkin.url));

    if (initialTracks) {
      this.store.dispatch(loadMediaFiles(initialTracks, LOAD_STYLE.BUFFER));
    }
    if (avaliableSkins) {
      this.store.dispatch({
        type: SET_AVALIABLE_SKINS,
        skins: avaliableSkins
      });
    }

    if (enableHotkeys) {
      new Hotkeys(this.store.dispatch);
    }
  }

  async renderWhenReady(node) {
    // Wait for the skin to load.
    await storeHas(this.store, state => !state.display.loading);

    render(
      <Provider store={this.store}>
        <App
          media={this.media}
          container={this.options.container}
          filePickers={this.options.filePickers}
        />
      </Provider>,
      node
    );
  }
}

export default Winamp;
module.exports = Winamp;
