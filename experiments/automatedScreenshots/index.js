const fs = require("fs");
const path = require("path");
const Filehound = require("filehound");
const md5File = require("md5-file");
const Shooter = require("./shooter");

(async () => {
  const shooter = new Shooter();
  const passedSkin = process.argv[2];
  let files = [];
  if (passedSkin) {
    files.push(passedSkin);
  } else {
    files = await Filehound.create()
      .ext("wsz")
      .paths("skins/")
      .find();
  }

  for (const skin of files) {
    console.log("Trying", skin);
    const skinMd5 = md5File.sync(skin);
    const screenshotPath = `screenshots/${skinMd5}.png`;
    if (fs.existsSync(screenshotPath)) {
      console.log(screenshotPath, "exists already");
      continue;
    }
    await shooter.takeScreenshot(path.join(__dirname, skin), screenshotPath, {
      minify: true
    });
  }

  await shooter.dispose();
})();
