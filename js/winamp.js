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
import { skinUrl, audioUrl, initialState } from "./config";

export default class Winamp {
  constructor(options) {
    this.options = options;

    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.style.display = "none";

    this.media = new Media(this.fileInput);
    this.store = getStore(this.media, initialState);
  }
  render(node) {
    render(
      <Provider store={this.store}>
        <App fileInput={this.fileInput} media={this.media} />
      </Provider>,
      node
    );

    this.fileInput.addEventListener("change", e => {
      this.store.dispatch(loadFileFromReference(e.target.files[0]));
    });

    this.store.dispatch(
      loadMediaFromUrl(audioUrl, "1. DJ Mike Llama - Llama Whippin' Intro")
    );
    this.store.dispatch(setSkinFromUrl(skinUrl));

    new Hotkeys(this.fileInput, this.store);
  }
}
