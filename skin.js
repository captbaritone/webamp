// Dynamically set the css background images for a skin
SkinManager = function() {
    var self = this;

    this.skinImages = {
        "#winamp": "MAIN.BMP",
        "#title-bar": "TITLEBAR.BMP",
        "#title-bar #option": "TITLEBAR.BMP",
        "#title-bar #minimize": "TITLEBAR.BMP",
        "#title-bar #shade": "TITLEBAR.BMP",
        "#title-bar #close": "TITLEBAR.BMP",
        ".status #clutter-bar": "TITLEBAR.BMP",
        ".status #play-pause": "PLAYPAUS.BMP",
        ".status #play-pause.play #work-indicator": "PLAYPAUS.BMP",
        ".status #time #minus-sign": "NUMBERS.BMP",
        ".media-info .mono-stereo div": "MONOSTER.BMP",
        "#volume": "VOLUME.BMP",
        "#volume::-webkit-slider-thumb": "VOLUME.BMP",
        "#volume::-moz-range-thumb": "VOLUME.BMP",
        "#balance": "BALANCE.BMP",
        "#balance::-webkit-slider-thumb": "VOLUME.BMP",
        "#balance::-moz-range-thumb": "VOLUME.BMP",
        ".windows div": "SHUFREP.BMP",
        "#position": "POSBAR.BMP",
        "#position::-webkit-slider-thumb": "POSBAR.BMP",
        "#position::-moz-range-thumb": "POSBAR.BMP",
        ".actions div": "CBUTTONS.BMP",
        "#eject": "CBUTTONS.BMP",
        ".shuffle-repeat div": "SHUFREP.BMP",
        ".character": "TEXT.BMP",
        ".digit": "NUMBERS.BMP",
        ".shade #position": "TITLEBAR.BMP",
        ".shade #position::-webkit-slider-thumb": "TITLEBAR.BMP",
        ".shade #position::-moz-range-thumb": "TITLEBAR.BMP",
    };

    this.setSkinByName = function(name) {
        url = "https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/" + name;
        self.setSkinByUrl(url);
    }

    this.setSkinByUrl = function(skinPath) {
        skinPath += "/";
        cssRules = '';
        for(var selector in self.skinImages) {
            var value = "background-image: url(" + skinPath + self.skinImages[selector] + ");";
            cssRules += selector + "{" + value + "}\n";

            var style = document.createElement('style');
            style.type = 'text/css';
            style.appendChild(document.createTextNode(cssRules));

            document.getElementsByTagName("head")[0].appendChild(style);
        }
    }
}

