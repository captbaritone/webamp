// Custom object representing a file
// `File` is already a builtin, so we use `MyFile`
export default function() {
  this.reader = new FileReader();
  this.name = null;
  this.url = null;
  this.fileReference = null;
  this.setUrl = function(url, name) {
    this.url = url;
    if (!name) {
      this.name = url.split("/").pop();
    } else {
      this.name = name;
    }
  };
  this.setFileReference = function(fileReference) {
    this.fileReference = fileReference;
    this.name = fileReference.name;
  };
  this.processBuffer = function(bufferHandler) {
    if (this.url) {
      const oReq = new XMLHttpRequest();
      oReq.open("GET", this.url, true);
      oReq.responseType = "arraybuffer";

      oReq.onload = function() {
        const arrayBuffer = oReq.response; // Note: not oReq.responseText
        bufferHandler(arrayBuffer);
      };

      oReq.send(null);
      return true;
    } else if (this.fileReference) {
      this.reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        bufferHandler(arrayBuffer);
      };
      this.reader.onerror = function(e) {
        console.error(e);
      };

      this.reader.readAsArrayBuffer(this.fileReference);
      return true;
    }

    console.error("Tried to process an unpopulated file object");
    return false;
  };
}
