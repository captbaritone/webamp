import * as Skins from "./data/skins";
import fs from "fs";
import md5Buffer from "md5";
import * as S3 from "./s3";
import Shooter from "./shooter";
import _temp from "temp";
import * as Analyser from "./analyser";

// TODO Move this into the function so that we clean up on each run?
const temp = _temp.track();

// TODO
// Extract the readme
// Extract the emails
// Upload to Internet Archive
// Store the Internet Archive item name
// Construct IA Webamp UR
type Result =
  | { md5: string; status: "FOUND" }
  | { md5: string; status: "ADDED"; averageColor: string };

export async function addSkinFromBuffer(
  buffer: Buffer,
  filePath: string,
  uploader: string
): Promise<Result> {
  const md5 = md5Buffer(buffer);
  const exists = await Skins.skinExists(md5);
  if (exists) {
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
