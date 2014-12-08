// Dynamically set the css background images for all the sprites
SkinManager = {
    fileManager: FileManager,
    font: Font,
    init: function(styleNode, visualizerNode, analyser) {
        this.styleNode = styleNode;
        this.visualizer = Visualizer.init(visualizerNode, analyser);
        return this;
    },

    _skinImages: {
        "#winamp": "MAIN.BMP",
        "#title-bar": "TITLEBAR.BMP",
        "#title-bar #option": "TITLEBAR.BMP",
        "#title-bar #minimize": "TITLEBAR.BMP",
        "#title-bar #shade": "TITLEBAR.BMP",
        "#title-bar #close": "TITLEBAR.BMP",
        ".status #clutter-bar": "TITLEBAR.BMP",
        ".status #clutter-bar div:active": "TITLEBAR.BMP",
        ".status #clutter-bar div.selected": "TITLEBAR.BMP",
        ".status #play-pause": "PLAYPAUS.BMP",
        ".play .status #work-indicator": "PLAYPAUS.BMP",
        ".status #time #minus-sign": "NUMBERS.BMP",
        ".status #time.ex #minus-sign": "NUMS_EX.BMP",
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
        // Put this second, since it will trump .digit
        ".digit-ex": "NUMS_EX.BMP",
        ".shade #position": "TITLEBAR.BMP",
        ".shade #position::-webkit-slider-thumb": "TITLEBAR.BMP",
        ".shade #position::-moz-range-thumb": "TITLEBAR.BMP",
    },

    // Given a file of an original Winamp WSZ file, set the current skin
    setSkinByFileReference: function(fileReference) {
        this.fileManager.bufferFromFileReference(fileReference, this._setSkinByBuffer.bind(this));
    },

    // Given the url of an original Winamp WSZ file, set the current skin
    setSkinByUrl: function(url) {
        this.fileManager.bufferFromUrl(url, this._setSkinByBuffer.bind(this));
    },

    // Given a bufferArray containing a Winamp WSZ file, set the current skin
    // Gets passed as a callback, so don't have access to `this`
    _setSkinByBuffer: function(buffer) {
        var zip = new JSZip(buffer);
        document.getElementById('time').classList.remove('ex');

        // XXX Ideally we would empty the style tag here, but I don't know how
        // Appending overwrites, which has the same net effect, but after
        // several skin changes, this tag will get pretty bloated.
        var cssRules = '';
        for(var selector in SkinManager._skinImages) {
            var fileName = SkinManager._skinImages[selector];
            var file = this._findFileInZip(fileName, zip);

            if (file) {
                var value = "background-image: url(data:image/bmp;base64," + btoa(file.asBinary()) + ")"
                cssRules += selector + "{" + value + "}\n";

                // CSS has to change if this file is present
                if(fileName == 'NUMS_EX.BMP') {
                    document.getElementById('time').classList.add('ex');
                }
            }
        }

        // Clear the loading state
        document.getElementById('winamp').classList.remove('loading');
        this.styleNode.appendChild(document.createTextNode(cssRules));

        this._parseVisColors(zip);

    },

    _parseVisColors: function(zip) {
        var entries = this._findFileInZip("VISCOLOR.TXT", zip).asText().split("\n");
        var regex = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
        var colors = [];
        // changed to a hard number to deal with empty lines at the end...
        // plus its only meant to be an exact amount of numbers anywayz
        // - @PAEz
        for(var i = 0; i < 24; i++) {
            var matches = regex.exec(entries[i]);
            if(matches) {
                colors[i] = 'rgb(' + matches.slice(1,4).join(',') + ')';
            } else {
                console.error('Error in VISCOLOR.TXT on line', i);
            }
        }
        this.visualizer.setColors(colors);
    },

    _findFileInZip: function(name, zip) {
        return zip.filter(function (relativePath, file){
            return new RegExp("(^|/)" + name, 'i').test(relativePath)
        })[0];
    }
}
