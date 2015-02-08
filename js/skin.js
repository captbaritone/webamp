// Dynamically set the css background images for all the sprites
SkinManager = {
    font: Font,
    init: function(visualizerNode, analyser) {
        this._createNewStyleNode();
        this.visualizer = Visualizer.init(visualizerNode, analyser);
        return this;
    },

    // For sprites that tile, we need to use just the sprite, not the whole image
    _skinSprites: SKIN_SPRITES,

    // Given a file of an original Winamp WSZ file, set the current skin
    setSkinByFile: function(file, completedCallback) {
        this.completedCallback = completedCallback;
        file.processBuffer(this._setSkinByBuffer.bind(this));
    },

    // Given a bufferArray containing a Winamp WSZ file, set the current skin
    // Gets passed as a callback, so don't have access to `this`
    _setSkinByBuffer: function(buffer) {
        var zip = new JSZip(buffer);
        document.getElementById('time').classList.remove('ex');

        var promisedCssRules = this._skinSprites.map(function(spriteObj) {

            // CSS has to change if this file is present
            if(spriteObj.img == 'NUMS_EX') {
                document.getElementById('time').classList.add('ex');
            }

            var file = this._findFileInZip(spriteObj.img, zip);
            if (file) {
                var src = "data:image/bmp;base64," + btoa(file.asBinary());
                return this._spriteCssRule(src, spriteObj);
            }
        }, this);

        // Extract sprite images
        Promise.all(promisedCssRules).then(function(newCssRules) {
            this._createNewStyleNode();
            cssRules = newCssRules.join('\n');
            this.styleNode.appendChild(document.createTextNode(cssRules));
            this._parseVisColors(zip);
            this.completedCallback();
        }.bind(this));
    },

    _parseVisColors: function(zip) {
        var entries = this._findFileInZip("VISCOLOR.TXT", zip).asText().split("\n");
        var regex = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/;
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
            return new RegExp("(^|/)" + name, 'i').test(relativePath);
        })[0];
    },

    _createNewStyleNode: function() {
        if(this.styleNode) {
            document.head.removeChild(this.styleNode);
        }
        this.styleNode = document.createElement('style');
        document.head.appendChild(this.styleNode);
    },

    // Given an image URL and coordinates, returns a data url for a sub-section
    // of that image
    _spriteCssRule: function(src, spriteObj) {
        return new Promise(function(resolve, reject) {
            var imageObj = new Image();
            imageObj.src = src;

            imageObj.onload = function() {
                var skinImage = this;
                var cssRules = '';
                var canvas = document.createElement('canvas');
                spriteObj.sprites.forEach(function(sprite) {
                    canvas.height = sprite.height;
                    canvas.width = sprite.width;

                    var context = canvas.getContext('2d');
                    context.drawImage(skinImage, -sprite.x, -sprite.y);
                    var value = "background-image: url(" + canvas.toDataURL() + ")";
                    sprite.selectors.forEach(function(selector) {
                        cssRules += selector + "{" + value + "}\n";
                    });
                });
                resolve(cssRules);
            };
        });
    }
};
