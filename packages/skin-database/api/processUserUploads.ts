import * as Skins from "../data/skins";
import S3 from "../s3";
import Discord, { TextChannel } from "discord.js";
import * as DiscordUtils from "../discord-bot/utils";
import * as Config from "../config";
import { addSkinFromBuffer, Result as AddResult } from "../addSkin";

let processing = false;

export async function processUserUploads() {
  // Ensure we only have one worker processing requests.
  if (processing) {
    return;
  }
  processing = true;
  const client = new Discord.Client();
  await client.login(Config.discordToken);
  const dest = client.channels.get(
    Config.SKIN_UPLOADS_CHANNEL_ID
  ) as TextChannel;

  let upload = await Skins.getReportedUpload();
  while (upload != null) {
    try {
      if (upload.id == null || upload.filename == null) {
        throw new Error(
          `Missing value in upload: ${upload.id} ${upload.filename}`
        );
      }
      const buffer = await S3.getUploadedSkin(upload.id);
      const result = await addSkinFromBuffer(
        buffer,
        upload.filename,
        "Web API"
      );
      await Skins.recordUserUploadArchived(upload.id);
      await reportSkinUpload(result, dest);
    } catch (e) {
      dest.send(
        `Encountered an error processing upload ${upload.id}: ${e.message}`
      );
      console.error(e);
      await Skins.recordUserUploadErrored(upload.id);
    }
    upload = await Skins.getReportedUpload();
  }

  processing = false;
}

async function reportSkinUpload(result: AddResult, dest: TextChannel) {
  if (result.status === "ADDED") {
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    if (result.skinType === "CLASSIC") {
      // Don't await
      DiscordUtils.postSkin({
        md5: result.md5,
        title: (filename) => `New skin uploaded: ${filename}`,
        dest,
      });
    } else if (result.skinType === "MODERN") {
      dest.send(`Someone uploaded a new modern skin: ${result.md5}`);
    }
  }
}
