const fsPromises = require("fs").promises;
const path = require("path");
const childProcess = require("child_process");
const JSZip = require("jszip");
const { FILE_TYPES } = require("./constants");

// Reduce an array down to it's unique value given an async hasher function
async function unique(arr, hasher) {
  const seen = new Set();
  const items = [];
  await Promise.all(
    arr.map(async (item) => {
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

function md5File(filePath) {
  return new Promise((resolve, reject) => {
    childProcess.execFile(`md5`, ["-q", filePath], (err, stdout) => {
      if (err) {
        // node couldn't execute the command
        reject(err);
      }

      resolve(stdout.trimRight());
    });
  });
}

function skinWasGenerated(filePath) {
  return new Promise((resolve) => {
    childProcess.execFile(
      `zipgrep`,
      ["This file was created by Skinamp", filePath],
      (err) => {
        if (err) {
          // node couldn't execute the command
          resolve(false);
        }

        resolve(true);
      }
    );
  });
}

function getArchiveItemName(skin) {
  const { filePaths } = skin;
  const filename = `${path.parse(filePaths[0]).name}`;
  const token = filename.replace(/[^0-9a-zA-Z]+/g, "_");
  return `winampskin_${token}`;
}

function getArchiveTitle(skin) {
  const { filePaths } = skin;
  const filename = `${path.parse(filePaths[0]).name}`;
  return `Winamp Skin: ${filename}`;
}

function archive(skin, itemName) {
  return new Promise((resolve, reject) => {
    const { classicMd5Path, filePaths, screenshotPath } = skin;
    const filename = `${path.parse(filePaths[0]).name}`;
    childProcess.execFile(
      `python`,
      [
        "/Users/jordaneldredge/projects/ia-skins/sync.py",
        classicMd5Path,
        screenshotPath,
        `${filename}.wsz`,
        getArchiveTitle(skin),
        itemName,
      ],
      (err, stdout) => {
        if (err) {
          // node couldn't execute the command
          reject(err);
        }

        resolve(stdout.trimRight());
      }
    );
  });
}

async function skinType(skinPath) {
  if (skinPath.endsWith(".wsz")) {
    return FILE_TYPES.CLASSIC;
  } else if (skinPath.endsWith(".wal")) {
    return FILE_TYPES.MODERN;
  }
  const buffer = await fsPromises.readFile(skinPath);
  try {
    const zip = await JSZip.loadAsync(buffer);
    if (zip.file(/.*\.(wsz|wal|zip)$/i).length) {
      // This is a collection of skins
      return FILE_TYPES.PACK;
    }
    const mains = zip.file(/^(.+\/)main\.bmp$/i);
    return mains.length === 1 ? FILE_TYPES.CLASSIC : FILE_TYPES.MODERN;
  } catch (e) {
    return FILE_TYPES.INVALID;
  }
}

module.exports = {
  unique,
  skinType,
  skinWasGenerated,
  md5File,
  archive,
  getArchiveItemName,
  getArchiveTitle,
};
