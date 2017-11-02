import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import getStore from "./store";
import App from "./components/App";
import Hotkeys from "./hotkeys";
import Media from "./media";
import {
  setSkinFromUrl,
  loadMediaFromUrl,
  loadFileFromReference
} from "./actionCreators";

import { SET_AVALIABLE_SKINS } from "./actionTypes";

class Winamp {
  constructor(options) {
    this.options = options;

    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.style.display = "none";

    this.media = new Media(this.fileInput);
    this.store = getStore(this.media, this.options.__initialState);
  }
  render(node) {
    render(
      <Provider store={this.store}>
        <App fileInput={this.fileInput} media={this.media} />
      </Provider>,
      node
    );

    this.fileInput.addEventListener("change", e => {
      if (e.target.files[0]) {
        this.store.dispatch(loadFileFromReference(e.target.files[0], true));
      }
    });

    if (this.options.initialTrack && this.options.initialTrack.url) {
      this.store.dispatch(
        loadMediaFromUrl(
          this.options.initialTrack.url,
          this.options.initialTrack.name,
          false
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

    new Hotkeys(this.fileInput, this.store);
  }

  loadTrackUrl(url, name) {
    this.store.dispatch(loadMediaFromUrl(url, name));
  }
}

export default Winamp;
module.exports = Winamp;
