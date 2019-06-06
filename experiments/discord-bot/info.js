const path = require("path");
const fs = require("fs");
const config = require("./config");

let cache = null;

function getCache() {
  if (cache == null) {
    cache = JSON.parse(
      fs.readFileSync(config.cachePath,
        "utf8"
      )
    );
  }
  return cache;
}

function getInfo(md5) {
  return getCache()[md5];
}

function getFilename(md5) {
  const info = getInfo(md5);
  return info.filePaths.map(filepath => path.basename(filepath))[0];
}

module.exports = { getInfo, getCache, getFilename };
