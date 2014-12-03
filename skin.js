(function(window, undefined) {
	/*
    These two would be bad practice according to one of my teachers....
    A class/module/woteva should never assume whats available and what its called
    it should be passed in (through init, public property) and named internaly (same name is fine)
    A class/module/woteva should be as singular as possible and know NOTHING of its surroundings
    Also, with an IIFE you normally pass in stuff from the outsid with its arguments to make globals
*/
	var fileManager = window.FileManager;
	var font = window.Font;

	function init(styleNode, visualizerNode, analyser) {
		self.styleNode = styleNode;
		self.visualizer = Visualizer.init(visualizerNode, analyser);
		return self;
	}

	var skinImages = {
		"#winamp": "MAIN.BMP",
		"#title-bar": "TITLEBAR.BMP",
		"#title-bar #option": "TITLEBAR.BMP",
		"#title-bar #minimize": "TITLEBAR.BMP",
		"#title-bar #shade": "TITLEBAR.BMP",
		"#title-bar #close": "TITLEBAR.BMP",
		".status #clutter-bar": "TITLEBAR.BMP",
		".status #play-pause": "PLAYPAUS.BMP",
		".play .status #work-indicator": "PLAYPAUS.BMP",
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
		// Put this second, since it will trump .digit
		".digit-ex": "NUMS_EX.BMP",
		".shade #position": "TITLEBAR.BMP",
		".shade #position::-webkit-slider-thumb": "TITLEBAR.BMP",
		".shade #position::-moz-range-thumb": "TITLEBAR.BMP",
	}

	// Given a file of an original Winamp WSZ file, set the current skin
	function setSkinByFileReference(fileReference) {
		fileManager.bufferFromFileReference(fileReference, _setSkinByBuffer);
	}

	// Given the url of an original Winamp WSZ file, set the current skin
	function setSkinByUrl(url) {
		fileManager.bufferFromUrl(url, _setSkinByBuffer);
	}

	// Given a bufferArray containing a Winamp WSZ file, set the current skin
	// Gets passed as a callback, so don't have access to `this`
	function _setSkinByBuffer(buffer) {
		var zip = new window.JSZip(buffer); // prolly should pass in with IIFE arguments..but BETTER is pass it in init, read the comment block at the top

		// XXX Ideally we would empty the style tag here, but I don't know how
		// Appending overwrites, which has the same net effect, but after
		// several skin changes, this tag will get pretty bloated.
		var cssRules = '';
		for (var selector in skinImages) {
			var fileName = skinImages[selector];
			var file = _findFileInZip(fileName, zip);

			if (file) {
				var value = "background-image: url(data:image/bmp;base64," + btoa(file.asBinary()) + ")"
				cssRules += selector + "{" + value + "}\n";
			}

		}

		// Clear the loading state
		document.getElementById('winamp').classList.remove('loading');
		self.styleNode.appendChild(document.createTextNode(cssRules));

		_parseVisColors(zip);
	}

	function _parseVisColors(zip) {
		var entries = _findFileInZip("VISCOLOR.TXT", zip).asText().split("\n");
		var regex = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
			// changed to a hard number to deal with empty lines at the end...
			// plus its only meant to be an exact amount of numbers anywayz
			// - @PAEz
		for (var i = 0; i < 24; i++) {
			var matches = regex.exec(entries[i]);
			if (matches) {
				self.visualizer.colors[i] = 'rgb(' + matches.slice(1, 4).join(',') + ')';
			} else {
				window.console.error('Error in VISCOLOR.TXT on line', i); // outside reference
				visColors.push('rgb(255,0,0)');
			}
		}
	}

    function _findFileInZip (name, zip) {
        return zip.filter(function (relativePath, file){
            return new RegExp("(^|/)" + name, 'i').test(relativePath)
        })[0];
    }

	var self = {
        fileManager:FileManager,
        font:Font,
		init: init,
		setSkinByFileReference: setSkinByFileReference,
		setSkinByUrl: setSkinByUrl
	}

	if (!window.SkinManager) window.SkinManager = self;

})(window);