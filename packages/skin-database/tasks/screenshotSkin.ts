// eslint-disable-next-line
import temp from "temp";
import fs from "fs";
import md5Buffer from "md5";
import * as S3 from "../s3";
import * as Skins from "../data/skins";
import * as CloudFlare from "../CloudFlare";
import SkinModel from "../data/SkinModel";

const Shooter = require("../shooter");

export async function screenshot(skin: SkinModel, shooter: typeof Shooter) {
  let buffer: Buffer;
  try {
    buffer = await skin.getBuffer();
  } catch {
    await Skins.recordScreenshotUpdate(
      skin.getMd5(),
      `Failed to get skin buffer.`
    );
    throw new Error("Failed to get skin buffer");
  }
  const actualMd5 = md5Buffer(buffer);
  if (skin.getMd5() !== actualMd5) {
    throw new Error("Downloaded skin had a different md5.");
  }

  const tempFile = temp.path({ suffix: ".wsz" });
  const tempScreenshotPath = temp.path({ suffix: ".png" });

  fs.writeFileSync(tempFile, buffer);

  const success = await shooter.takeScreenshot(tempFile, tempScreenshotPath, {
    minify: true,
    md5: skin.getMd5(),
  });

  if (!success) {
    fs.unlinkSync(tempFile);
    fs.unlinkSync(tempScreenshotPath);
    temp.cleanupSync();
    throw new Error("Screenshot failed.");
  }
  await S3.putScreenshot(skin.getMd5(), fs.readFileSync(tempScreenshotPath));
  await CloudFlare.purgeFiles([Skins.getScreenshotUrl(actualMd5)]);
  fs.unlinkSync(tempFile);
  fs.unlinkSync(tempScreenshotPath);
}
