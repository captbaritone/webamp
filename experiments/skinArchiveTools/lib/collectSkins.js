const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const childProcess = require("child_process");
const Bluebird = require("bluebird");
const { memoize } = require("lodash");
// const md5File = require("md5-file/promise");
const Filehound = require("filehound");
const Utils = require("./utils");
const { FILE_TYPES } = require("./constants");

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

const memoizedMd5File = memoize(md5File);

async function collectFile(filePath, outputDir) {
  const flatSkinDir = path.join(outputDir, "md5skins");

  const md5 = await memoizedMd5File(filePath);

  const md5Path = path.join(flatSkinDir, `${md5}.wsz`);
  // It's faster to check if the file exists, than to actually look at the skin file
  // This is just an optimization
  const skinType = fs.existsSync(md5Path)
    ? FILE_TYPES.CLASSIC
    : await Utils.skinType(filePath);

  let destination = null;
  switch (skinType) {
    case [FILE_TYPES.CLASSIC]:
      destination = md5Path;
      break;
    /*
    case [FILE_TYPES.INVALID]:
      destination = path.join(outputDir, `md5Invalids/${md5}.wsz`);
      break;
    case [FILE_TYPES.PACK]:
      const packPath = path.join(outputDir, `md5Packs/${md5}`);
      if (fs.existsSync(packPath)) {
        break;
      }
      try {
        childProcess.execSync(`unzip "${filePath}" -d "${packPath}"`);
      } catch (e) {
        console.log(e);
      }
      break;
    */
    default:
      //
      break;
  }
  if (destination != null && !fs.existsSync(destination)) {
    await fsPromises.link(filePath, destination);
  }
  return { filePath, md5, md5Path, skinType };
}

module.exports = async function collectSkins({
  inputDir,
  outputDir,
  filenamesPath
}) {
  const files = await Filehound.create()
    .ext(["zip", "wsz"])
    .paths(inputDir)
    .find();

  const seen = new Set();
  let tried = 0;

  const interval = setInterval(() => {
    console.log({ seen: seen.size, tried, total: files.length });
  }, 10000);
  // We use Bluebird so that we can limit the concurrency.
  const collectionInfo = (await Bluebird.map(
    files,
    async filePath => {
      const md5 = await memoizedMd5File(filePath);
      tried++;
      if (seen.has(md5)) {
        return null;
      }
      seen.add(md5);
      return collectFile(filePath, outputDir);
    },
    { concurrency: 50 }
  )).filter(Boolean);
  clearInterval(interval);

  console.log("moved all files", "---------------------------");

  const classics = collectionInfo.filter(
    info => info.skinType === FILE_TYPES.CLASSIC
  );
  const pathList = classics
    .map(info => `${info.md5} ${path.relative(inputDir, info.filePath)}`)
    .join("\n");

  console.log(`Writing ${classics.length} files to ${filenamesPath}`);

  await fsPromises.writeFile(filenamesPath, pathList);
  console.log("done");
  return {
    total: files.length,
    unique: collectionInfo.length,
    newScreenshots: collectionInfo.filter(info => info.screenshotCreated)
      .length,
    classic: collectionInfo.filter(info => info.skinType === FILE_TYPES.CLASSIC)
      .length,
    packs: collectionInfo.filter(info => info.skinType === FILE_TYPES.PACK)
      .length,
    invalid: collectionInfo.filter(info => info.skinType === FILE_TYPES.INVALID)
      .length,
    modern: collectionInfo.filter(info => info.skinType === FILE_TYPES.MODERN)
      .length,
    // TODO: Tell modern skins from packs
    nonClassic: collectionInfo.filter(info => !info.classic).length
  };
};
