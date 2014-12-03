(function(window, undefined) {

	var reader = new FileReader();

	function bufferFromFileReference(fileReference, bufferHandler) {
		reader.onload = function(e) {
			var arrayBuffer = e.target.result;
			bufferHandler(arrayBuffer);
		};
		reader.onerror = function(e) {
			//console.error(e);
		};

		reader.readAsArrayBuffer(fileReference);
	}

	function bufferFromUrl(url, bufferHandler) {
		var oReq = new XMLHttpRequest();
		oReq.open("GET", url, true);
		oReq.responseType = "arraybuffer";

		oReq.onload = function(oEvent) {
			var arrayBuffer = oReq.response; // Note: not oReq.responseText
			bufferHandler(arrayBuffer);
		};

		oReq.send(null);
	}

	var self = {
		reader: reader,
		bufferFromFileReference: bufferFromFileReference,
		bufferFromUrl: bufferFromUrl
	}

	if (!window.FileManager) window.FileManager = self;

})(window);