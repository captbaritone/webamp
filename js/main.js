import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import createReducer from './reducers';

import Browser from './browser';
import mainWindowDom from './main-window-dom';
import Winamp from './winamp';
import ContextMenu from './ContextMenu.jsx';
import Hotkeys from './hotkeys';

import '../css/winamp.css';
import '../css/main-window.css';

if (new Browser(window).isCompatible) {
  var mainWindowElement = document.createElement('div');
  mainWindowElement.appendChild(mainWindowDom);
  document.getElementById('winamp2-js').appendChild(mainWindowElement);

  var winamp = Winamp.init({
    volume: 50,
    balance: 0,
    mediaFile: {
      url: 'https://cdn.rawgit.com/captbaritone/llama/master/llama-2.91.mp3',
      name: "1. DJ Mike Llama - Llama Whippin' Intro"
    },
    skinUrl: 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/base-2.91.wsz'
  });

  let store = createStore(createReducer(winamp));

  new Hotkeys(winamp);
  render(
    <Provider store={store}>
      <ContextMenu winamp={winamp} />
    </Provider>,
    document.getElementById('context-menu-holder')
  );
} else {
  document.getElementById('winamp').style.display = 'none';
  document.getElementById('browser-compatibility').style.display = 'block';
}
