// Dynamically set the css background images for all the sprites
SkinManager = function() {
    var self = this;

    this._skinImages = {
        "#winamp": "MAIN.BMP",
        "#title-bar": "TITLEBAR.BMP",
        "#title-bar #option": "TITLEBAR.BMP",
        "#title-bar #minimize": "TITLEBAR.BMP",
        "#title-bar #shade": "TITLEBAR.BMP",
        "#title-bar #close": "TITLEBAR.BMP",
        ".status #clutter-bar": "TITLEBAR.BMP",
        ".status #play-pause": "PLAYPAUS.BMP",
        ".play .status #play-pause #work-indicator": "PLAYPAUS.BMP",
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
    }

    // For local dev, we want to use the asset we have locally
    this.useLocalDefaultSkin = function() {
        self.setSkinByUrl('skins/default');
    }

    // I have a collection of skins on GitHub to make loading remote skins
    // easier. rawgit.com changes this into a free CDN
    this.setSkinByName = function(name) {
        url = "https://cdn.rawgit.com/captbaritone/winamp-skins/master/v2/" + name;
        self.setSkinByUrl(url);
    }

    // Given the URL of a skin directory, set the current skin
    this.setSkinByUrl = function(skinPath) {
        // Make sure we have a trailing slash. Two slashes are > than none
        skinPath += "/";

        var style = document.getElementById('skin');
        // XXX Ideally we would empty the style tag here, but I don't know how.
        // Appending overwrites, which has the same net effect, but after
        // several skin changes, this tag will get pretty bloated.
        var cssRules = '';
        for(var selector in self._skinImages) {
            var imagePath = skinPath + self._skinImages[selector];
            var value = "background-image: url(" + imagePath + ");";
            cssRules += selector + "{" + value + "}\n";
            style.appendChild(document.createTextNode(cssRules));
        }
    }
}
