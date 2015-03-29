var scriptTag = document.currentScript;

var loadCss = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function(e) {
        if (this.status == 200) {
            var style = document.createElement("style");

            style.appendChild(document.createTextNode(this.response));

            document.head.appendChild(style);
        }
    };
    xhr.send();
};

loadCss('embed.css');

var xhr = new XMLHttpRequest();
xhr.open('GET', 'html/template.html');
xhr.onload = function(e) {
  if (this.status == 200) {
    initFromTemplate(this.response);
  }
};
xhr.send();

var initFromTemplate = function (template) {
    var node = document.createElement('div');
    node.style.position = "relative";
    node.innerHTML = template;

    if (scriptTag.nextSibling) {
        scriptTag.parentNode.insertBefore(node, scriptTag.nextSibling);
    }
    else {
        scriptTag.parentNode.appendChild(node);
    }
    if(Browser.isCompatible()) {
        winamp = Winamp.init({
            'volume': 50,
            'balance': 0,
            'mediaFile': {
                'url': scriptTag.dataset.media
            },
            'skinUrl': 'https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/base-2.91.wsz'
        });

        Hotkeys.init(winamp);
        Context.init(winamp);
    } else {
        document.getElementById('winamp').style.display = 'none';
        document.getElementById('browser-compatibility').style.display = 'block';
    }
};


