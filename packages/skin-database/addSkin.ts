import * as Skins from "./data/skins";
import fs from "fs";
import md5Buffer from "md5";
import * as S3 from "./s3";
import Shooter from "./shooter";
import _temp from "temp";
import * as Analyser from "./analyser";
import { SkinType } from "./types";
import SkinModel from "./data/SkinModel";
import UserContext from "./data/UserContext";
import JSZip from "jszip";

// TODO Move this into the function so that we clean up on each run?
const temp = _temp.track();

// TODO
// Extract the readme
// Extract the emails
// Upload to Internet Archive
// Store the Internet Archive item name
// Construct IA Webamp UR
export type Result =
  | { md5: string; status: "FOUND" }
  | { md5: string; status: "ADDED"; skinType: SkinType };

export async function addSkinFromBuffer(
  buffer: Buffer,
  filePath: string,
  uploader: string
): Promise<Result> {
  const ctx = new UserContext();
  const md5 = md5Buffer(buffer);
  if (await SkinModel.exists(ctx, md5)) {
    return { md5, status: "FOUND" };
  }

  // Note: This will thrown on invalid skins.
  const zip = await JSZip.loadAsync(buffer);
  const skinType = await Analyser.getSkinType(zip);

  switch (skinType) {
    case "CLASSIC":
      return addClassicSkinFromBuffer(buffer, md5, filePath, uploader);
    case "MODERN":
      return addModernSkinFromBuffer(buffer, md5, filePath, uploader);
  }
}

async function addModernSkinFromBuffer(
  buffer: Buffer,
  md5: string,
  filePath: string,
  uploader: string
): Promise<Result> {
  const tempFile = temp.path({ suffix: ".wal" });
  fs.writeFileSync(tempFile, buffer);
  await S3.putSkin(md5, buffer, "wal");

  await Skins.addSkin({
    md5,
    filePath,
    uploader,
    modern: true,
    readmeText: null,
  });

  return { md5, status: "ADDED", skinType: "MODERN" };
}

async function addClassicSkinFromBuffer(
  buffer: Buffer,
  md5: string,
  filePath: string,
  uploader: string
): Promise<Result> {
  const tempFile = temp.path({ suffix: ".wsz" });
  fs.writeFileSync(tempFile, buffer);
  const tempScreenshotPath = temp.path({ suffix: ".png" });

  await Shooter.withShooter((shooter) =>
    shooter.takeScreenshot(tempFile, tempScreenshotPath, {
      minify: true,
      md5,
    })
  );

  await S3.putScreenshot(md5, fs.readFileSync(tempScreenshotPath));
  await S3.putSkin(md5, buffer, "wsz");
  const zip = await JSZip.loadAsync(buffer);
  const readmeText = await Analyser.getReadme(zip);
  await Skins.addSkin({
    md5,
    filePath,
    uploader,
    modern: false,
    readmeText,
  });

  await Skins.updateSearchIndex(md5);
  return { md5, status: "ADDED", skinType: "CLASSIC" };
}
