const path = require("path");
const fs = require("fs");
const Bluebird = require("bluebird");
const collectSkins = require("./collectSkins");
const Utils = require("./utils");
const { FILE_TYPES } = require("./constants");
const { getColor } = require("./color");
const { extractTextData } = require("./readme");
const Shooter = require("./shooter");

/**
 * Usage
 *
 * command <input_dir> <output_dir> <screenshot_dir>
 */

const CACHE_PATH = "/Volumes/Mobile Backup/skins/cache/";

const [
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _node,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _thisFile,
  rawInputDir,
  rawOutputDir,
] = process.argv;

const inputDir = path.resolve(rawInputDir);
const outputDir = path.resolve(rawOutputDir);

// It's nice to be able to fiddle these manually
const collect = false;
const getTypes = false;
const moveHome = false;
const screenshots = false;
const detectGenerated = false;
const archive = false;
const force = false;
const color = false;
const favorites = false;
const readme = true;
const cacheFilePath = path.join(CACHE_PATH, "info.json");

function getPath(skin) {
  const filePath = skin.filePaths[0];
  if (filePath == null) {
    throw new Error(`Missing file path for ${skin.md5}`);
  }
  return filePath;
}

async function main() {
  // Run this if new files are added
  const start = Date.now();
  let cache = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
  console.log("parsed cache in ", (Date.now() - start) / 1000, "seconds");

  // Writing a backup
  const cacheBackupFilePath = path.join(
    CACHE_PATH,
    `backup-${Date.now()}.json`
  );
  fs.writeFileSync(cacheBackupFilePath, JSON.stringify(cache, null, 2));
  console.log(`Wrote a backup of the cache to ${cacheBackupFilePath}`);

  function report() {
    let classic = 0;
    let modern = 0;
    let invalid = 0;
    let screenshotCount = 0;
    let archived = 0;
    let generated = 0;
    Object.values(cache).forEach((skin) => {
      switch (skin.type) {
        case FILE_TYPES.CLASSIC:
          classic++;
          break;
        case FILE_TYPES.MODERN:
          modern++;
          break;
        case FILE_TYPES.INVALID:
          invalid++;
          break;
      }
      if (skin.screenshotPath) {
        screenshotCount++;
      }
      if (skin.iaItemName) {
        archived++;
      }
      if (skin.generated === true) {
        generated++;
      }
    });
    console.log(`${classic} classic skins`);
    console.log(`${modern} modern skins`);
    console.log(`${invalid} invalid skins`);
    console.log(`${screenshotCount} screenshots`);
    console.log(`${generated} generated`);
    console.log(`${archived} archived`);
  }

  function save() {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
  }

  console.log("Starting with...");
  report();

  if (collect) {
    console.log("Collecting skins");
    cache = await collectSkins({ inputDir, cache });
    save();
  }
  if (moveHome) {
    console.log("Moving skins to md5AllSkins");
    Object.values(cache).forEach((skin) => {
      const md5Path = path.join(outputDir, "md5AllSkins", `${skin.md5}`);
      if (md5Path === skin.md5Path) {
        return;
      }
      if (!fs.existsSync(md5Path)) {
        fs.linkSync(getPath(skin), md5Path);
      }
      skin.md5Path = md5Path;
    });
    save();
    console.log("Moving classic skins to md5Skins");
    Object.values(cache)
      .filter((skin) => skin.type === FILE_TYPES.CLASSIC)
      .forEach((skin) => {
        const classicMd5Path = path.join(
          outputDir,
          "md5Skins",
          `${skin.md5}.wsz`
        );
        if (classicMd5Path === skin.classicMd5Path) {
          return;
        }
        if (!fs.existsSync(classicMd5Path)) {
          fs.linkSync(getPath(skin), classicMd5Path);
        }
        skin.classicMd5Path = classicMd5Path;
      });
    save();
  }
  if (getTypes) {
    console.log("Computing skin types");
    const skins = Object.values(cache);
    let i = 0;
    console.log(`Ran on ${i} of ${skins.length} skins`);
    const interval = setInterval(() => {
      console.log(`Ran on ${i} of ${skins.length} skins`);
      console.log("Saving...");

      save();
    }, 10000);
    await Bluebird.map(
      skins,
      async (skin) => {
        if (skin.type && force === false) {
          return;
        }
        skin.type = await Utils.skinType(getPath(skin));
        i++;
      },
      { concurrency: 10 }
    );
    clearInterval(interval);
    save();
  }
  if (screenshots) {
    console.log("Taking screenshots");
    const skins = Object.values(cache);
    let i = 0;
    let j = 0;
    const interval = setInterval(() => {
      console.log(`Took ${i} screenshots`);
      console.log(`Found ${j} screenshots`);
      console.log("Saving...");

      save();
    }, 10000);

    const needScreenshot = skins.filter((skin) => {
      return skin.type === FILE_TYPES.CLASSIC && !skin.screenshotPath;
    });

    console.log(`Need to take ${needScreenshot.length} screenshots...`);

    if (needScreenshot.length > 0) {
      const shooter = new Shooter();
      await shooter.init();
      for (const skin of needScreenshot) {
        const screenshotPath = path.join(
          outputDir,
          "md5Screenshots",
          `${skin.md5}.png`
        );
        if (!fs.existsSync(screenshotPath) || force) {
          await shooter.takeScreenshot(getPath(skin), screenshotPath, {
            minify: true,
          });
          i++;
        } else {
          j++;
        }
        skin.screenshotPath = screenshotPath;
      }
      shooter.dispose();
    }
    clearInterval(interval);
    console.log(`Took ${i} screenshots`);
    console.log(`Found ${j} screenshots`);
    save();
  }

  if (detectGenerated) {
    const unknownSkins = Object.values(cache).filter(
      (skin) => skin.type === FILE_TYPES.CLASSIC && skin.generated == null
    );
    console.log(
      `Found ${unknownSkins.length} skins to check if they are generated`
    );
    let i = 0;
    let j = 0;
    const interval = setInterval(() => {
      console.log(`Found ${i} generated skins out of ${j}`);
      console.log("Saving...");

      save();
    }, 10000);
    await Bluebird.map(
      unknownSkins,
      async (skin) => {
        const generated = await Utils.skinWasGenerated(skin.classicMd5Path);
        j++;
        if (generated) {
          i++;
        }
        skin.generated = generated;
      },
      { concurrency: 10 }
    );
    clearInterval(interval);
    save();
  }

  if (archive) {
    const classicSkins = Object.values(cache).filter(
      (skin) => skin.type === FILE_TYPES.CLASSIC && skin.iaItemName == null
    );

    const seenItemNames = new Set();
    Object.values(cache).forEach((skin) => {
      if (skin.iaItemName != null) {
        seenItemNames.add(skin.iaItemName.toLowerCase());
      }
    });

    await Bluebird.map(
      classicSkins,
      async (skin) => {
        const itemName = Utils.getArchiveItemName(skin);
        console.log("going to upload ", itemName);
        if (seenItemNames.has(itemName.toLowerCase())) {
          console.log(itemName, "already exists");
          return;
        }
        try {
          await Utils.archive(skin, itemName);
        } catch (e) {
          console.error(e);
          return;
        }
        console.log("Uploaded:", itemName);
        skin.iaItemName = itemName;
        seenItemNames.add(itemName.toLowerCase());
        save();
      },
      { concurrency: 4 }
    );
    save();
  }

  if (color) {
    const classicSkins = Object.values(cache).filter(
      (skin) => skin.type === FILE_TYPES.CLASSIC
    );
    let i = 0;
    const interval = setInterval(() => {
      console.log(`Found the average color of ${i} skins`);
      console.log("Saving...");

      save();
    }, 10000);

    await Bluebird.map(
      classicSkins,
      async (skin) => {
        if (skin.screenshotPath == null) {
          console.log("Could not extract color from skin");
          return;
        }
        if (skin.averageColor != null && !force) {
          return;
        }
        const averageColor = await getColor(skin.screenshotPath);
        skin.averageColor = averageColor;
        i++;
      },
      { concurrency: 10 }
    );
    clearInterval(interval);
    save();
  }

  if (favorites) {
    const content = fs.readFileSync(
      path.join("/Volumes/Mobile Backup/skins/", "likes.txt"),
      "utf8"
    );
    content.split("\n").forEach((line) => {
      if (!line.length) {
        return;
      }
      const [hash, likes] = line.split(" ");
      const skin = cache[hash];
      if (!skin) {
        console.log(`Found like for unknown skin ${hash}`);
        return;
      }
      skin.twitterLikes = likes;
    });
    save();
  }

  if (readme) {
    const classicSkins = Object.values(cache).filter(
      (skin) => skin.type === FILE_TYPES.CLASSIC
    );
    let i = 0;
    const interval = setInterval(() => {
      console.log(`Found readme text for ${i} skins`);
      console.log("Saving...");

      save();
    }, 10000);

    await Bluebird.map(
      classicSkins,
      async (skin) => {
        const readmePath = path.join(outputDir, "readmes", `${skin.md5}.txt`);
        // if (skin.readmePath || skin.emails) {
        if (skin.readmePath !== undefined) {
          return;
        }
        if (fs.existsSync(readmePath)) {
          skin.readmePath = readmePath;
          i++;
          return;
        }
        const { emails, raw } = await extractTextData(skin.md5Path);
        skin.emails = emails;
        if (raw) {
          fs.writeFileSync(readmePath, raw);
          skin.readmePath = readmePath;
        } else {
          // Note that we extracted it, but found nothing
          skin.readmePath = null;
          i++;
        }
      },
      { concurrency: 10 }
    );
    clearInterval(interval);
    save();
  }
  console.log("Ended with...");
  report();
  save();
}

// Blastoff!
main();
