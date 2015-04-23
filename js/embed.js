// Putting this inside require breaks, because it's called as a callback
var scriptTag = document.currentScript;

require([
    'browser',
    '../rjs/text!../html/main-window.html',
    '../rjs/css!../css/cleanslate.css',
    '../rjs/css!../css/winamp.css',
    'winamp',
    'context',
    'hotkeys'
], function(
    Browser,
    mainWindowHtml,
    cleanslateCss,
    winampCss,
    Winamp,
    Context,
    Hotkeys
) {
    var node = document.createElement('div');

    scriptTag.parentNode.insertBefore(node, scriptTag);
    var media = scriptTag.dataset.media ? scriptTag.dataset.media : 'https://cdn.rawgit.com/captbaritone/llama/master/llama-2.91.mp3';

    if(Browser.isCompatible()) {
        node.innerHTML = mainWindowHtml;
        node.setAttribute("id", "winamp2-js");

        var winamp = Winamp.init({
            'volume': 50,
            'balance': 0,
            'mediaFile': {
                'url': media
            },
            'skinUrl':
            'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/base-2.91.wsz'
        });

        Hotkeys.init(winamp);
        Context.init(winamp);
    } else {
        var audio = document.createElement('audio');
        audio.src = media;
        audio.setAttribute('controls', true);
        node.appendChild(audio);
    }
});
