// Putting this inside require breaks, because it's called as a callback
var scriptTag = document.currentScript;

require([
  'browser',
  'main-window-dom',
  '../rjs/css!../css/cleanslate.css',
  '../rjs/css!../css/winamp.css',
  'winamp',
  'context',
  'hotkeys'
], function(
  Browser,
  mainWindowDom,
  cleanslateCss,
  winampCss,
  Winamp,
  Context,
  Hotkeys
) {
  var node = document.createElement('div');

  scriptTag.parentNode.insertBefore(node, scriptTag);
  var options = scriptTag.dataset;

  var media = options.media ? options.media : 'https://cdn.rawgit.com/captbaritone/llama/master/llama-2.91.mp3';
  var skin = options.skin ? options.skin : 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/base-2.91.wsz';
  var hotKeys = typeof options.hotkeys !== 'undefined';

  if (Browser.isCompatible()) {
    node.appendChild(mainWindowDom);
    node.setAttribute('id', 'winamp2-js');

    var winamp = Winamp.init({
      volume: 50,
      balance: 0,
      mediaFile: {
        url: media
      },
      skinUrl: skin
    });

    if (hotKeys) {
      Hotkeys.init(winamp);
    }
    Context.init(winamp);
  } else {
    var audio = document.createElement('audio');
    audio.src = media;
    audio.setAttribute('controls', true);
    node.appendChild(audio);
  }
});
