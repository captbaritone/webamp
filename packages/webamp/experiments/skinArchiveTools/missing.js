const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const fetch = require("node-fetch");

async function main() {
  const screenshotDir = "/Volumes/Mobile Backup/skins/md5Screenshots/";
  const skinDir = "/Volumes/Mobile Backup/skins/md5Skins/";
  const filenamesPath = "/Volumes/Mobile Backup/skins/filenames.txt";

  const filenames = await fsPromises.readFile(filenamesPath, "utf8");
  const filenamesMap = new Map();
  filenames.split("\n").forEach((line) => {
    const md5 = line.slice(0, 32);
    const filename = line.slice(33);
    filenamesMap.set(md5, filename);
  });

  const skins = await fsPromises.readdir(skinDir);
  const screenshots = await fsPromises.readdir(screenshotDir);

  const skinMd5s = skins.map((skinPath) => path.basename(skinPath, ".wsz"));
  const screenshotMd5s = screenshots.map((screenshotPath) =>
    path.basename(screenshotPath, ".png")
  );

  const skinMd5sSet = new Set(skinMd5s);

  const missing = screenshotMd5s.filter((md5) => !skinMd5sSet.has(md5));

  await Promise.all(
    missing.map(async (md5) => {
      const filename = filenamesMap.get(md5);
      if (filename == null) {
        return;
      }
      const dest = path.join(
        "/Volumes/Mobile Backup/skins/skins/recovered/",
        `${filename}`
      );

      if (fs.existsSync(dest)) {
        return;
      }

      const buffer = await fetch(
        `https://s3.amazonaws.com/webamp-uploaded-skins/skins/${md5}.wsz`
      );

      await fsPromises.writeFile(dest, buffer);

      console.log(dest);
    })
  );
  // console.log(missingFiles);
}

main();
