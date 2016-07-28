import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import createReducer from './reducers';

import Browser from './browser';
import MainWindow from './MainWindow.jsx';
import Winamp from './winamp';
import Hotkeys from './hotkeys';

if (new Browser(window).isCompatible) {
  var winamp = Winamp;
  let store = createStore(
    createReducer(winamp),
    window.devToolsExtension && window.devToolsExtension(),
    applyMiddleware(thunk)
  );

  render(
    <Provider store={store}>
      <MainWindow winamp={winamp} mediaPlayer={winamp.media} />
    </Provider>,
    document.getElementById('winamp2-js')
  );

  winamp.dispatch = store.dispatch;

  winamp.init({
    volume: 50,
    balance: 0,
    mediaFile: {
      url: process.env.NODE_ENV === 'production' ? 'https://cdn.rawgit.com/captbaritone/llama/master/llama-2.91.mp3' : 'llama-2.91.mp3',
      name: "1. DJ Mike Llama - Llama Whippin' Intro"
    },
    skinUrl: process.env.NODE_ENV === 'production' ? 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/base-2.91.wsz' : 'base-2.91.wsz'
  });

  new Hotkeys(winamp, store);
} else {
  document.getElementById('winamp').style.display = 'none';
  document.getElementById('browser-compatibility').style.display = 'block';
}
