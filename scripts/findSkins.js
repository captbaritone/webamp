const fs = require("fs");
const path = require("path");
const Bluebird = require("bluebird");

const info = JSON.parse(
  fs.readFileSync("/Volumes/Mobile Backup/skins/cache/info.json", "utf8")
);

const getFileData = async () => {
  const fileData = {};
  await Bluebird.map(
    Object.values(info).filter(skin => skin.type === "CLASSIC"),
    async skin => {
      const md5 = skin.md5;
      const filePaths = skin.filePaths;
      if (!filePaths || filePaths.length === 0) {
        console.warn("no file name for ", md5);
        return;
      }
      if (skin.twitterLikes) {
        console.log({ skin });
      }
      const fileName = path.basename(filePaths[0]);
      fileData[md5] = {
        color: skin.averageColor,
        favorites: skin.twitterLikes,
        fileName
      };
    },
    { concurrency: 10 }
  );
  return fileData;
};

console.log("Extracting skin data from cache");
getFileData().then(data => {
  const json = JSON.stringify(data);
  fs.writeFileSync("src/skins.json", json, "utf8");
});
