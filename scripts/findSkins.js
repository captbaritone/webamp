const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
const Bluebird = require("bluebird");
const shellescape = require("shell-escape");

const getFileNames = async () => {
  const content = fs.readFileSync(
    "/Volumes/Mobile Backup/skins/pathnames.txt",
    "utf8"
  );
  const fileNames = {};
  content.split("\n").forEach(line => {
    if (!line.length) {
      return;
    }
    const [hash, pathName] = line.split(" ");
    fileNames[hash] = path.basename(pathName);
  });
  return fileNames;
};

const getFavoriteCounts = () => {
  const content = fs.readFileSync(path.join(__dirname, "../likes.txt"), "utf8");
  const favorites = {};
  content.split("\n").forEach(line => {
    if (!line.length) {
      return;
    }
    const [hash, fileName] = line.split(" ");
    favorites[hash] = fileName;
  });
  return favorites;
};
const testFolder = path.resolve(
  __dirname,
  "/Volumes/Mobile Backup/skins/md5Screenshots"
);
const files = fs
  .readdirSync(testFolder)
  .filter(skinPath => skinPath.endsWith(".png"));

const genAverage = img => {
  return new Promise((resolve, reject) => {
    const imgPath = shellescape([path.join(testFolder, img)]);
    const command = `convert ${imgPath} -scale 1x1\! -format '%[pixel:u]' info:-`;
    exec(command, (error, stdout, stderr) => {
      if (error !== null) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

const getFileData = async files => {
  const fileNames = await getFileNames();
  const favortes = getFavoriteCounts();
  console.log(favortes);
  const fileData = {};
  await Bluebird.map(
    files,
    async file => {
      const md5 = path.basename(file, ".png");
      const fileName = fileNames[md5];
      if (!fileName) {
        console.warn("no file name for ", md5);
        return;
      }
      fileData[md5] = {
        color: (await genAverage(file)).slice(1),
        favorites: favortes[md5],
        fileName
      };
    },
    { concurrency: 10 }
  );
  return fileData;
};

console.log("Finding the average color of screenshots...");
console.log("This might take a moment");
getFileData(files).then(data => {
  const json = JSON.stringify(data);
  fs.writeFileSync("src/skins.json", json, "utf8");
});
