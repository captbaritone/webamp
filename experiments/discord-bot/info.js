const path = require("path");
const fs = require("fs");

let cache = null;

function getCache() {
  if (cache == null) {
    cache = JSON.parse(
      fs.readFileSync(
        path.join("/Volumes/Mobile Backup/skins/cache", "info.json"),
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
