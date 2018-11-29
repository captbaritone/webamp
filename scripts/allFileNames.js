var glob = require("glob");
const path = require("path");
var { exec } = require("child_process");
const _ = require("lodash");

function allSkinPaths() {
  return new Promise((resolve, reject) => {
    glob(
      path.join(
        __dirname,
        "../../webamp/experiments/automatedScreenshots/skins/",
        "**/*.wsz"
      ),
      function(err, files) {
        if (err != null) {
          reject(err);
          return;
        }
        resolve(files);
      }
    );
  });
}

async function filenamesForSkin(skinPath) {
  const paths = await new Promise((resolve, reject) => {
    exec(`zipinfo -1 ${skinPath}`, function(error, stdout, stderr) {
      if (error != null) {
        //reject(error);
        //return;
      }
      resolve(stdout);
    });
  });
  return paths.split("\n");
}

async function allFilenames() {
  const skins = await allSkinPaths();
  const paths = _.flatten(
    await Promise.all(
      skins.map(skin => {
        return filenamesForSkin(skin);
      })
    )
  );

  const fileNames = paths.map(p => path.basename(p).toLowerCase());
  const uniqueFileNames = {};
  for (fileName of fileNames) {
    uniqueFileNames[fileName] =
      uniqueFileNames[fileName] == null ? 1 : uniqueFileNames[fileName] + 1;
  }
  const entries = Object.entries(uniqueFileNames);
  const sorted = _.sortBy(entries, ([filename, count]) => count);
  console.log(JSON.stringify(sorted, null, 2));
}

allFilenames();
