const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const childProcess = require("child_process");
const Bluebird = require("bluebird");
const { memoize } = require("lodash");
const md5File = require("md5-file/promise");
const Filehound = require("filehound");
const Utils = require("./utils");
const { FILE_TYPES } = require("./constants");

const memoizedMd5File = memoize(md5File);

module.exports = async function collectSkins({
  inputDir,
  outputDir,
  filenamesPath
}) {
  const flatSkinDir = path.join(outputDir, "md5skins");
  const files = await Filehound.create()
    .ext(["zip", "wsz"])
    .paths(inputDir)
    .find();

  const seen = new Set();

  // We use Bluebird so that we can limit the concurrency.
  const collectionInfo = (await Bluebird.map(
    files,
    async filePath => {
      const md5 = await memoizedMd5File(filePath);
      if (seen.has(md5)) {
        return null;
      }
      seen.add(md5);
      const md5Path = path.join(flatSkinDir, `${md5}.wsz`);
      const info = { filePath, md5, moved: false, md5Path };
      if (fs.existsSync(md5Path)) {
        info.skinType = FILE_TYPES.CLASSIC;
        return info;
      }
      info.skinType = await Utils.skinType(filePath);
      if (info.skinType !== FILE_TYPES.CLASSIC) {
        return info;
      }
      await fsPromises.link(filePath, info.md5Path);
      info.moved = true;
      return info;
    },
    { concurrency: 50 }
  )).filter(Boolean);

  console.log("moved all files", "---------------------------");

  const pathList = collectionInfo
    .map(info => `${info.md5} ${path.relative(inputDir, info.filePath)}`)
    .join("\n");

  fsPromises.writeFile(filenamesPath, pathList);
  collectionInfo
    .filter(info => info.skinType === FILE_TYPES.PACK)
    .forEach(pack => {
      const packPath = path.join(outputDir, `md5Packs/${pack.md5}`);
      if (fs.existsSync(packPath)) {
        return;
      }
      try {
        childProcess.execSync(`unzip "${pack.filePath}" -d "${packPath}"`);
      } catch (e) {
        console.log(e);
      }
    });
  collectionInfo
    .filter(info => info.skinType === FILE_TYPES.INVALID)
    .forEach(async invalid => {
      const filePath = path.join(outputDir, `md5Invalids/${invalid.md5}.wsz`);
      if (fs.existsSync(filePath)) {
        return;
      }
      await fsPromises.link(invalid.filePath, filePath, invalid.md5Path);
    });
  return {
    total: files.length,
    unique: collectionInfo.length,
    moved: collectionInfo.filter(info => info.moved).length,
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
