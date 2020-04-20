const fs = require("fs");
const md5Buffer = require("md5");
const Skins = require("./data/skins");
const S3 = require("./s3");
const Shooter = require("./shooter");
const temp = require("temp").track();
const Analyser = require("./analyser");

// TODO
// Extract the readme
// Extract the emails
// Extract the average color
// Upload to Internet Archive
// Store the Internet Archive item name
// Construct IA Webamp UR
async function addSkinFromBuffer(buffer, filePath, uploader) {
  const md5 = md5Buffer(buffer);
  const skin = await Skins.getSkinByMd5(md5);
  if (skin != null) {
    return { md5, status: "FOUND" };
  }
  const tempFile = temp.path({ suffix: ".wsz" });
  fs.writeFileSync(tempFile, buffer);
  const tempScreenshotPath = temp.path({ suffix: ".png" });

  await Shooter.withShooter((shooter) =>
    shooter.takeScreenshot(tempFile, tempScreenshotPath, {
      minify: true,
    })
  );

  const averageColor = await Analyser.getColor(tempScreenshotPath);
  await S3.putScreenshot(md5, fs.readFileSync(tempScreenshotPath));
  await S3.putSkin(md5, buffer);
  await Skins.addSkin({ md5, filePath, uploader, averageColor });
  return { md5, status: "ADDED", averageColor };
}

module.exports = { addSkinFromBuffer };
