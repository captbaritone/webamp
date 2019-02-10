const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const childProcess = require("child_process");
const { memoize } = require("lodash");
const md5File = require("md5-file/promise");
const Filehound = require("filehound");
const Utils = require("./utils");

const memoizedMd5File = memoize(md5File);

module.exports = async function collectSkins({
  inputDir,
  outputDir,
  filenamesPath
}) {
  const files = await Filehound.create()
    .ext(["zip", "wsz"])
    .paths(inputDir)
    .find();

  const uniqueFiles = await Utils.unique(files, memoizedMd5File);

  const collectionInfo = await Promise.all(
    uniqueFiles.map(async filePath => {
      const md5 = await memoizedMd5File(filePath);
      const skinType = await Utils.skinType(filePath);
      const md5Path = path.join(outputDir, `${md5}.wsz`);
      const info = { filePath, md5, skinType, moved: false, md5Path };
      if (info.skinType !== "CLASSIC") {
        return info;
      }
      const exists = fs.existsSync(info.md5Path);
      if (!exists) {
        await fsPromises.link(filePath, info.md5Path);
        info.moved = true;
      }
      return info;
    })
  );

  const pathList = collectionInfo
    .map(info => `${info.md5} ${path.relative(inputDir, info.filePath)}`)
    .join("\n");

  fsPromises.writeFile(filenamesPath, pathList);
  collectionInfo
    .filter(info => info.skinType === "PACK")
    .forEach(pack => {
      const packPath = path.resolve(`./assets/md5Packs/${pack.md5}`);
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
    .filter(info => info.skinType === "INVALID")
    .forEach(async invalid => {
      const filePath = path.resolve(`./assets/md5Invalids/${invalid.md5}.wsz`);
      if (fs.existsSync(filePath)) {
        return;
      }
      await fsPromises.link(invalid.filePath, filePath, invalid.md5Path);
    });
  return {
    total: files.length,
    unique: uniqueFiles.length,
    moved: collectionInfo.filter(info => info.moved).length,
    newScreenshots: collectionInfo.filter(info => info.screenshotCreated)
      .length,
    classic: collectionInfo.filter(info => info.skinType === "CLASSIC").length,
    packs: collectionInfo.filter(info => info.skinType === "PACK").length,
    invalid: collectionInfo.filter(info => info.skinType === "INVALID").length,
    modern: collectionInfo.filter(info => info.skinType === "MODERN").length,
    // TODO: Tell modern skins from packs
    nonClassic: collectionInfo.filter(info => !info.classic).length
  };
};
