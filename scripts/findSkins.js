const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
const shellescape = require("shell-escape");

const testFolder = path.join(__dirname, "../public/screenshots/");
const files = fs
  .readdirSync(testFolder)
  .filter(skinPath => skinPath.endsWith(".png"));

const genAverage = img => {
  return new Promise((resolve, reject) => {
    const imgPath = shellescape([
      path.join(__dirname, "../public/screenshots", img)
    ]);
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
  const fileData = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Intentional blocking async loop so we don't use too many child
    // Processes
    fileData.push({
      file,
      color: (await genAverage(file)).slice(1)
    });
  }
  return fileData;
};

getFileData(files).then(data => {
  const json = JSON.stringify(data);
  fs.writeFileSync("src/skins.json", json, "utf8");
});
