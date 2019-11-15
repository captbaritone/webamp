const path = require("path");
const fs = require("fs");
const { imageHash } = require("image-hash");

const hashes = new Map();

fs.readFileSync(path.join(__dirname, "./hash.txt"), "utf8")
  .split("\n")
  .forEach(line => {
    const [md5, imgHash] = line.split(" ");
    hashes.set(md5, imgHash);
  });

console.warn(`Already hashed ${hashes.size} images`);

function hash(skinPath) {
  return new Promise((resolve, reject) => {
    imageHash(skinPath, 16, true, (error, data) => {
      if (error) {
        return reject(error);
      }
      resolve(data);
    });
  });
}

async function main() {
  const screenshotDir = "/Volumes/Mobile Backup/skins/md5Screenshots/";
  const screenshots = fs.readdirSync(screenshotDir);
  console.warn("Found", screenshots.length, "screenshots");
  for (let i = 0; i < screenshots.length; i++) {
    const fileName = screenshots[i];
    const [md5] = fileName.split(".");
    if (hashes.has(md5)) {
      continue;
    }
    try {
      const skinhash = await hash(path.join(screenshotDir, fileName));
      // console.warn(`${md5} ${skinhash}`, `${i}/${screenshots.length}`);
      process.stderr.write(".");
      console.log(`${md5} ${skinhash}`);
    } catch (e) {
      console.error(e);
    }
  }
}

main();
