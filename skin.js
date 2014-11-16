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
        self.setSkinByUrl('skins/base-2.91.wsz');
    }

    // I have a collection of skins on GitHub to make loading remote skins
    // easier. rawgit.com changes this into a free CDN
    this.setSkinByName = function(name) {
        url = "https://cdn.rawgit.com/elliots/winamp2-js/master/skins/" + name + ".wsz";
        self.setSkinByUrl(url);
    }

    // Given the url of an original Winamp WSZ file, set the current skin
    this.setSkinByUrl = function(url) {

      JSZipUtils.getBinaryContent(url, function(err, data) {

        if (err) {
          alert('Failed to load skin ' + url + ' : ' + err);
        }

        try {

          var zip = new JSZip(data);

          var style = document.getElementById('skin');
          var cssRules = '';
          for(var selector in self._skinImages) {

            var file = zip.filter(function (relativePath, file){
              return new RegExp("($|/)" + self._skinImages[selector], 'i').test(relativePath)
            })[0];

            if (!file) {
              console.log("Warning: Couldn't find file:" + self._skinImages[selector])
            } else {
              var value = "background-image: url(data:image/bmp;base64," + btoa(file.asBinary()) + ")"
              cssRules += selector + "{" + value + "}\n";
            }
          }
          style.appendChild(document.createTextNode(cssRules));

        } catch(e) {
          alert('Failed to load skin ' + url + ' : ' + e.message);
        }
      })

    }
}
