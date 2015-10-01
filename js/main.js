require([
    'browser',
    '../rjs/text!../html/main-window.html',
    '../rjs/css!../css/winamp.css',
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
    document.getElementById('embed-link').onclick = function() {
        document.getElementById('embed').classList.toggle('selected');
        document.getElementById('embed-input').select();
        return false;
    };
    if(Browser.isCompatible()) {
        var mainWindowElement = document.createElement('div');
        mainWindowElement.innerHTML = mainWindowHtml;
        document.getElementById('winamp2-js').appendChild(mainWindowElement);

        var winamp = Winamp.init({
            'volume': 50,
            'balance': 0,
            'mediaFile': {
                // 'url': "https://cdn.rawgit.com/captbaritone/llama/master/llama-2.91.mp3",
                // Not using cdn subdomain, because it does not return
                // content-lenght: https://github.com/rgrove/rawgit/issues/81
                'url': "https://rawgit.com/captbaritone/llama/master/llama-2.91.mp3",
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
