const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const Shooter = require("./shooter");

module.exports = async function takeScreenshots(skinDir, screenshotDir) {
  console.log(`Looking for skins in ${skinDir}`);
  const files = await fsPromises.readdir(skinDir);
  console.log(`Found ${files.length} skins`);
  let skipCount = 0;
  let shotCount = 0;
  const interval = setInterval(() => {
    console.log(`Update: Skipped: ${skipCount}`);
    console.log(`Update: Shot: ${shotCount}`);
  }, 10000);
  const shooter = new Shooter();
  for (const fileName of files) {
    const filePath = path.join(skinDir, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error("wat", filePath);
    }
    const md5 = path.basename(filePath, ".wsz");
    const screenshotPath = path.join(screenshotDir, `${md5}.png`);
    if (fs.existsSync(screenshotPath)) {
      skipCount++;
      continue;
    }
    await shooter.takeScreenshot(filePath, screenshotPath, {
      minify: true,
    });
    shotCount++;
  }
  clearInterval(interval);
  console.log(`FINAL: Skipped: ${skipCount}`);
  console.log(`FINAL: Shot: ${shotCount}`);
};
