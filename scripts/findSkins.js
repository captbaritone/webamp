const fs = require("fs");
const path = require("path");
const Bluebird = require("bluebird");

const info = JSON.parse(
  fs.readFileSync("/Volumes/Mobile Backup/skins/cache/info.json", "utf8")
);

const getFileData = async () => {
  const fileData = await Bluebird.map(
    Object.values(info).filter(skin => skin.type === "CLASSIC"),
    async skin => {
      const md5 = skin.md5;
      const filePaths = skin.filePaths;
      if (!filePaths || filePaths.length === 0) {
        console.warn("no file name for ", md5);
        return;
      }
      if (skin.twitterLikes) {
        // console.log({ skin });
      }
      const fileName = path.basename(filePaths[0]);
      return {
        color: skin.averageColor,
        favorites: skin.twitterLikes || 0,
        fileName,
        md5
      };
    },
    { concurrency: 10 }
  );
  const orderedFileData = fileData.sort((a, b) => {
    return b.favorites - a.favorites;
  });
  return orderedFileData.map(({ favorites, ...rest }) => rest);
};

const SKIN_DATA_ROOT = "public/skinData";
const BOOTSTRAP_SKIN_DATA_ROOT = "src";
const CHUNK_SIZE = 500;
getFileData().then(data => {
  let start = 0;
  const chunkFileNames = [];
  let chunkNumber = 0;
  while (start <= data.length) {
    const end = start + CHUNK_SIZE;

    const chunk = data.slice(start, end);
    const json = JSON.stringify(chunk);
    const fileName = `skins-${chunkNumber}.json`;
    fs.writeFileSync(path.join(SKIN_DATA_ROOT, fileName), json, "utf8");
    if (chunkNumber === 0) {
      fs.writeFileSync(
        path.join(BOOTSTRAP_SKIN_DATA_ROOT, fileName),
        json,
        "utf8"
      );
    }
    chunkFileNames.push(fileName);
    start = end;
    chunkNumber++;
  }
  const json = JSON.stringify(
    {
      chunkSize: CHUNK_SIZE,
      numberOfSkins: data.length,
      chunkFileNames
    },
    null,
    2
  );
  fs.writeFileSync(
    path.join(BOOTSTRAP_SKIN_DATA_ROOT, "skins.json"),
    json,
    "utf8"
  );
});
