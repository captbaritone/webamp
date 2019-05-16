const path = require("path");
const fs = require("fs");
const algoliasearch = require("algoliasearch");

const client = algoliasearch("HQ9I5Z6IM5", "f5357f4070cdb6ed652d9c3feeede89f");
const index = client.initIndex("Skins");

const CACHE_PATH = "/Volumes/Mobile Backup/skins/cache/";
const info = JSON.parse(
  fs.readFileSync(path.join(CACHE_PATH, "info.json"), "utf8")
);

function tuncate(str, len) {
  const overflow = str.length - len;
  if (overflow < 0) {
    return str;
  }

  const half = Math.floor((len - 1) / 2);

  const start = str.slice(0, half);
  const end = str.slice(-half);
  return `${start} ########### ${end}`;
}

async function buildSkinIndex(skin) {
  const { md5, filePaths } = skin;
  if (!filePaths || filePaths.length === 0) {
    console.warn("no file name for ", md5);
    return;
  }
  const fileName = path.basename(filePaths[0]);
  let readmeText = null;
  if (skin.readmePath) {
    readmeText = tuncate(fs.readFileSync(skin.readmePath, "utf8"), 4800);
  }
  return {
    objectID: skin.md5,
    //md5,
    //fileName,
    // emails: skin.emails || null,
    readmeText
  };
}

const indexesPromise = Promise.all(
  Object.values(info)
    .filter(skin => skin.type === "CLASSIC")
    .filter(skin => skin.readmePath)
    .map(skin => buildSkinIndex(skin))
);

async function go() {
  const indexes = await indexesPromise;

  console.log("Writing index");
  const results = await new Promise((resolve, reject) => {
    index.partialUpdateObjects(indexes, function(err, content) {
      if (err != null) reject(err);
      resolve(content);
    });
  });
  console.log("done!", results);
}

go(); // .then(content => console.log("Updated index for:", content.length));
