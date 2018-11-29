const path = require("path");
const fs = require("fs");
const md5File = require("md5-file");
var { exec } = require("child_process");

const METADATA_ROOT = path.join(__dirname, "../metadata/");

function getSkinMetadataPath(md5, key) {
  return path.join(METADATA_ROOT, md5, `${key}.json`);
}

function getSkinMetadata(md5, key) {
  const skinMetadataPath = getSkinMetadataPath(md5, key);
  return new Promise((resolve, reject) => {
    fs.readFile(skinMetadataPath, "utf8", (err, data) => {
      if (err != null) reject(err);
      resolve(JSON.parse(data));
    });
  });
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

async function writeSkinMetadata(md5, key, data) {
  const skinMetadataPath = getSkinMetadataPath(md5, key);
  ensureDirectoryExistence(skinMetadataPath);
  return new Promise((resolve, reject) => {
    fs.writeFile(
      skinMetadataPath,
      JSON.stringify(data, null, 2),
      "utf8",
      err => {
        if (err != null) {
          reject(err);
        }
        resolve(skinMetadataPath);
      }
    );
  });
}

function getFileMd5(filePath) {
  return new Promise((resolve, reject) => {
    md5File(filePath, (err, hash) => {
      if (err) reject(err);

      resolve(hash);
    });
  });
}

module.exports = {
  getSkinMetadata,
  writeSkinMetadata
};
