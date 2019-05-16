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
        favorites: skin.twitterLikes,
        fileName,
        md5
      };
    },
    { concurrency: 10 }
  );
  const orderedFileData = fileData.sort((a, b) => {
    return a.favorites < b.favorites;
  });
  return orderedFileData.map(({ favorites, ...rest }) => rest);
};

const CHUNK_SIZE = 100;
getFileData().then(data => {
  let start = 0;
  const chunkFileNames = [];
  let chunkNumber = 0;
  while (start <= data.length) {
    const end = start + CHUNK_SIZE;

    const chunk = data.slice(start, end);
    const json = JSON.stringify(chunk);
    const fileName = `skins-${chunkNumber}.json`;
    fs.writeFileSync(path.join("src", "skinData", fileName), json, "utf8");
    chunkFileNames.push(fileName);
    start = end;
    chunkNumber++;
  }
  const json = JSON.stringify({
    numberOfSkins: data.length,
    chunkFileNames
  });
  fs.writeFileSync("src/skinData/skins.json", json, "utf8");
});
