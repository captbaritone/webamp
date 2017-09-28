import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import getStore from "./store";
import App from "./components/App";
import Browser from "./browser";
import Winamp from "./winamp";
import Hotkeys from "./hotkeys";
import { skinUrl, audioUrl, hideAbout, initialState } from "./config";

if (new Browser(window).isCompatible) {
  if (hideAbout) {
    document.getElementsByClassName("about")[0].style.visibility = "hidden";
  }
  const winamp = Winamp;

  const store = getStore(winamp, initialState);
  window.store = store;

  render(
    <Provider store={store}>
      <App winamp={winamp} />
    </Provider>,
    document.getElementById("winamp2-js")
  );

  winamp.dispatch = store.dispatch;

  winamp.init({
    volume: 50,
    balance: 0,
    mediaFile: {
      url: audioUrl,
      name: "1. DJ Mike Llama - Llama Whippin' Intro"
    },
    skinUrl: skinUrl
  });

  new Hotkeys(winamp, store);
} else {
  document.getElementById("browser-compatibility").style.display = "block";
}
