import SparkMD5 from "spark-md5";

export function hashFile(file) {
  var blobSlice =
    File.prototype.slice ||
    File.prototype.mozSlice ||
    File.prototype.webkitSlice;
  const chunkSize = 2097152; // Read in chunks of 2MB
  const chunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  const spark = new SparkMD5.ArrayBuffer();

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      spark.append(e.target.result); // Append array buffer
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end()); // Compute hash
      }
    };

    fileReader.onerror = reject;

    function loadNext() {
      var start = currentChunk * chunkSize,
        end = start + chunkSize >= file.size ? file.size : start + chunkSize;

      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();
  });
}
