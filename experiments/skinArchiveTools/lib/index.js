const path = require("path");
const collectSkins = require("./collectSkins");
const takeScreenshots = require("./takeScreenshots");

/**
 * Usage
 *
 * command <input_dir> <output_dir> <screenshot_dir>
 */

// eslint-disable-next-line no-unused-vars
const [
  _node,
  _thisFile,
  rawInputDir,
  rawOutputDir,
  rawScreenshotDir,
  rawFilenamesPath
] = process.argv;

const inputDir = path.resolve(rawInputDir);
const outputDir = path.resolve(rawOutputDir);
const screenshotDir = path.resolve(rawScreenshotDir);
const filenamesPath = path.resolve(rawFilenamesPath);

const collect = true;
const screenshots = true;

async function main() {
  if (collect) {
    const collectionInfo = await collectSkins({
      filenamesPath,
      inputDir,
      outputDir
    });
    console.log(collectionInfo);
    const packCollectionInfo = await collectSkins({
      filenamesPath,
      inputDir: path.resolve(path.join("assets", "md5Packs")),
      outputDir
    });
    console.log(packCollectionInfo);
  }
  if (screenshots) {
    await takeScreenshots(outputDir, screenshotDir);
  }
}

// Blastoff!
main();
