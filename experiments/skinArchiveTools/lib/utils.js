const fsPromises = require("fs").promises;
const JSZip = require("jszip");
const { FILE_TYPES } = require("./constants");

// Reduce an array down to it's unique value given an async hasher function
async function unique(arr, hasher) {
  const seen = new Set();
  const items = [];
  await Promise.all(
    arr.map(async item => {
      const key = await hasher(item);
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      items.push(item);
    })
  );
  return items;
}

async function skinType(skinPath) {
  const buffer = await fsPromises.readFile(skinPath);
  try {
    const zip = await JSZip.loadAsync(buffer);
    if (zip.file(/.*\.(wsz|wal|zip)$/i).length) {
      // This is a collection of skins
      return FILE_TYPES.PACK;
    }
    return zip.file(/^main\.bmp$/i).length === 1
      ? FILE_TYPES.CLASSIC
      : FILE_TYPES.MODERN;
  } catch (e) {
    return FILE_TYPES.INVALID;
  }
}

module.exports = { unique, skinType };
