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
        var mainWindowElement = document.createElement('div');
        mainWindowElement.innerHTML = mainWindowHtml;
        document.getElementById('main-window-parent').appendChild(mainWindowElement);

        var winamp = Winamp.init({
            'volume': 50,
            'balance': 0,
            'mediaFile': {
                'url': "https://cdn.rawgit.com/captbaritone/llama/master/llama-2.91.mp3",
                'name': "1. DJ Mike Llama - Llama Whippin' Intro"
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
