// Custom object representing a file
// `File` is already a builtin, so we use `MyFile`
module.exports = function() {
  this.reader = new FileReader();
  this.url = null;
  this.fileReference = null;
  this.setUrl = function(url){
    this.url = url;
  };
  this.setFileReference = function(fileReference){
    this.fileReference = fileReference;
  };
  this.processBuffer = function(bufferHandler) {
    if (this.url) {
      var oReq = new XMLHttpRequest();
      oReq.open('GET', this.url, true);
      oReq.responseType = 'arraybuffer';

      oReq.onload = function() {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        bufferHandler(arrayBuffer);
      };

      oReq.send(null);
      return true;

    } else if (this.fileReference) {
      this.reader.onload = function(e) {
        var arrayBuffer = e.target.result;
        bufferHandler(arrayBuffer);
      };
      this.reader.onerror = function(e) {
        console.error(e);
      };

      this.reader.readAsArrayBuffer(this.fileReference);
      return true;
    }

    console.error('Tried to process an unpopulated file object');
    return false;
  };
};
