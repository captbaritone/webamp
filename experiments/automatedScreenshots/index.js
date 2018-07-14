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
    const fileName = `${path.basename(skin).replace(/\//g, "-")}-${skinMd5}`;
    const screenshotPath = `screenshots/${skinMd5}.png`;
    const flatSkinFile = `flatSkins/${fileName}.wsz`;
    if (!fs.existsSync(flatSkinFile)) {
      fs.linkSync(skin, flatSkinFile);
    }
    const md5SkinFile = `md5Skins/${skinMd5}.wsz`;
    if (!fs.existsSync(md5SkinFile)) {
      console.log("Linked skin from", skin, "to", md5SkinFile);
      fs.linkSync(skin, md5SkinFile);
    }
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
