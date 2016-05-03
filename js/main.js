define([
  'browser',
  'main-window-dom',
  '../css/winamp.css',
  '../css/main-window.css',
  '../css/context-menu.css',
  'winamp',
  'context',
  'hotkeys'
], function(
  Browser,
  mainWindowDom,
  winampCss,
  mainWindowCss,
  contextMenuCss,
  Winamp,
  Context,
  Hotkeys
) {
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

    new Hotkeys(winamp);
    new Context(winamp);
  } else {
    document.getElementById('winamp').style.display = 'none';
    document.getElementById('browser-compatibility').style.display = 'block';
  }
});
