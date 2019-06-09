const path = require("path");
const fs = require("fs");

let cache = null;

function getCache() {
  if (cache == null) {
    cache = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../info.json"), "utf8")
    );
  }
  return cache;
}

// TODO: Make async and rewriting using DB
function getInfo(md5) {
  return getCache()[md5];
}

// TODO: Make async and rewriting using DB
function getFilename(md5) {
  const info = getInfo(md5);
  return info.filePaths.map(filepath => path.basename(filepath))[0];
}

module.exports = { getInfo, getCache, getFilename };
