const path = require("path");
const fs = require("fs");
const md5File = require("md5-file/promise");
const Filehound = require("filehound");
const Shooter = require("./shooter");

module.exports = async function takeScreenshots(skinDir, screenshotDir) {
  const files = await Filehound.create()
    .ext(["wsz"])
    .paths(skinDir)
    .find();
  const shooter = new Shooter();
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) {
      throw new Error("wat", filePath);
    }
    const md5 = await md5File(filePath);
    const screenshotPath = path.join(screenshotDir, `${md5}.png`);
    if (fs.existsSync(screenshotPath)) {
      continue;
    }
    await shooter.takeScreenshot(filePath, screenshotPath, {
      minify: true
    });
  }
};
