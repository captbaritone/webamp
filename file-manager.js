// Handle common file interactions
function FileManager () {
    this.reader = new FileReader()

    // Given an input node, returns a functional URL
    this.urlFromInput = function(input) {
        var file = input.files[0];
        return this.urlFromFileReference(file);
    }.bind(this)

    this.urlFromFileReference = function(fileReference) {
        return URL.createObjectURL(fileReference);
    }

    this.bufferFromFileReference = function(fileReference, bufferHandler) {
        this.reader.onload = function (e) {
            var arrayBuffer = e.target.result;
            bufferHandler(arrayBuffer);
        };
        this.reader.onerror = function (e) {
            //console.error(e);
        };

        this.reader.readAsArrayBuffer(fileReference);
    }.bind(this)

    this.bufferFromUrl = function(url, bufferHandler) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            bufferHandler(arrayBuffer);
        };

        oReq.send(null);
    }.bind(this)
}
