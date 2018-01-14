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
  render(node) {
    render(
      <Provider store={this.store}>
        <App media={this.media} />
      </Provider>,
      node
    );

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
    this.store.dispatch(setSkinFromUrl(this.options.initialSkin.url));

    new Hotkeys(this.store.dispatch);
  }
}

export default Winamp;
module.exports = Winamp;
