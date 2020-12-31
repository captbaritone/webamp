// eslint-disable-next-line
import _temp from "temp";
import fs from "fs";
import fetch from "node-fetch";
import md5Buffer from "md5";
import * as S3 from "../s3";
import * as Skins from "../data/skins";
import * as CloudFlare from "../CloudFlare";

const Shooter = require("../shooter");
const temp = _temp.track();

export async function screenshot(md5: string, shooter: typeof Shooter) {
  const url = Skins.getSkinUrl(md5);
  const response = await fetch(url);
  if (!response.ok) {
    await Skins.recordScreenshotUpdate(md5, `Failed to download from ${url}.`);
    console.error(`Failed to download skin from "${url}".`);
    return;
  }
  const buffer = await response.buffer();
  const actualMd5 = md5Buffer(buffer);
  if (md5 !== actualMd5) {
    throw new Error("Downloaded skin had a different md5.");
  }

  const tempFile = temp.path({ suffix: ".wsz" });
  const tempScreenshotPath = temp.path({ suffix: ".png" });

  fs.writeFileSync(tempFile, buffer);

  console.log("Starting screenshot");
  const success = await shooter.takeScreenshot(tempFile, tempScreenshotPath, {
    minify: true,
    md5,
  });
  if (success) {
    console.log("Completed screenshot");
    await S3.putScreenshot(md5, fs.readFileSync(tempScreenshotPath));
    await CloudFlare.purgeFiles([Skins.getScreenshotUrl(actualMd5)]);
  } else {
    console.log(`Screenshot failed ${md5}`);
  }
}
