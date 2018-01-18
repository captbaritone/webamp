import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import getStore from "./store";
import App from "./components/App";
import Hotkeys from "./hotkeys";
import Media from "./media";
import { setSkinFromUrl, loadMediaFromUrl } from "./actionCreators";

import { SET_AVALIABLE_SKINS } from "./actionTypes";

class Winamp {
  constructor(options) {
    this.options = options;

    this.media = new Media();
    this.store = getStore(this.media, this.options.__initialState);
  }

  _skinHasLoaded() {
    return new Promise(resolve => {
      const initialState = this.store.getState();
      if (!initialState.display.loading) {
        resolve();
        return;
      }
      const unsubscribe = this.store.subscribe(() => {
        const state = this.store.getState();
        if (!state.display.loading) {
          resolve();
          unsubscribe();
        }
      });
    });
  }

  async render(node) {
    this.store.dispatch(setSkinFromUrl(this.options.initialSkin.url));

    if (this.options.initialTrack && this.options.initialTrack.url) {
      this.store.dispatch(
        loadMediaFromUrl(
          this.options.initialTrack.url,
          this.options.initialTrack.name,
          "BUFFER"
        )
      );
    }
    if (this.options.avaliableSkins) {
      this.store.dispatch({
        type: SET_AVALIABLE_SKINS,
        skins: this.options.avaliableSkins
      });
    }

    new Hotkeys(this.store.dispatch);

    await this._skinHasLoaded();

    render(
      <Provider store={this.store}>
        <App media={this.media} />
      </Provider>,
      node
    );
  }
}

export default Winamp;
module.exports = Winamp;
