const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
const shellescape = require("shell-escape");
const https = require("https");

const FILENAME_URL =
  "https://s3-us-west-2.amazonaws.com/winamp2-js-skins/filenames.txt";

const getFileNames = async () => {
  const content = await new Promise(resolve =>
    https.get(FILENAME_URL, response => {
      var data = "";
      response.on("data", function(chunk) {
        data += chunk;
      });
      response.on("end", function() {
        resolve(data);
      });
    })
  );
  const fileNames = {};
  content.split("\n").forEach(line => {
    if (!line.length) {
      return;
    }
    const [hash, fileName] = line.split(" ");
    fileNames[hash] = fileName;
  });
  return fileNames;
};
const testFolder = path.join(
  __dirname,
  "../../webamp/experiments/automatedScreenshots/screenshots/"
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
  const fileData = {};
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const md5 = path.basename(file, ".png");
    const fileName = fileNames[md5];
    if (!fileName) {
      console.warn("no file name for ", md5);
      continue;
    }
    // Intentional blocking async loop so we don't use too many child
    // Processes
    fileData[md5] = {
      color: (await genAverage(file)).slice(1),
      fileName
    };
  }
  return fileData;
};

console.log("Finding the average color of screenshots...");
console.log("This might take a moment");
getFileData(files).then(data => {
  const json = JSON.stringify(data);
  fs.writeFileSync("src/skins.json", json, "utf8");
});
