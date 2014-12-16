// Handle common file interactions
FileManager = {
    reader: new FileReader(),

    bufferFromFileReference: function(fileReference, bufferHandler) {
        this.reader.onload = function (e) {
            var arrayBuffer = e.target.result;
            bufferHandler(arrayBuffer);
        };
        this.reader.onerror = function (e) {
            //console.error(e);
        };

        this.reader.readAsArrayBuffer(fileReference);
    },

    bufferFromUrl: function(url, bufferHandler) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            bufferHandler(arrayBuffer);
        };

        oReq.send(null);
    }
}
