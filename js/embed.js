// Putting this inside require breaks, because it's called as a callback
var scriptTag = document.currentScript;

require([
    'browser',
    'text!../html/main-window.html',
    'css!../css/winamp.css',
    'winamp',
    'context',
    'hotkeys'
], function(
    Browser,
    mainWindowHtml,
    pageCss,
    Winamp,
    Context,
    Hotkeys
) {
    if(Browser.isCompatible()) {
        var node = document.createElement('div');
        node.setAttribute("id", "main-window-parent");
        node.innerHTML = mainWindowHtml;

        if (scriptTag.nextSibling) {
            scriptTag.parentNode.insertBefore(node, scriptTag.nextSibling);
        }
        else {
            scriptTag.parentNode.appendChild(node);
        }

        var winamp = Winamp.init({
            'volume': 50,
            'balance': 0,
            'mediaFile': {
                'url': scriptTag.dataset.media
            },
            'skinUrl':
            'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/base-2.91.wsz'
        });

        Hotkeys.init(winamp);
        Context.init(winamp);
    } else {
        document.getElementById('winamp').style.display = 'none';
        document.getElementById('browser-compatibility').style.display = 'block';
    }
});
