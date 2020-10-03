import logger from "../logger";
import fs from "fs";
import * as Skins from "../data/skins";
import { TWEET_BOT_CHANNEL_ID, TWITTER_CREDS } from "../config";
import { Client } from "discord.js";
import { SkinRecord } from "../types";
import _temp from "temp";
import sharp from "sharp";
import { getTwitterClient } from "../twitter";
const temp = _temp.track();

export async function tweet(discordClient: Client, anything: string | null) {
  const tweetBotChannel = discordClient.channels.get(TWEET_BOT_CHANNEL_ID);
  if (tweetBotChannel == null) {
    throw new Error("Could not connect to the #tweet-bot channel");
  }
  let tweetableSkin: null | SkinRecord = null;
  if (anything != null) {
    const _md5 = await Skins.getMd5ByAnything(anything);
    if (_md5 == null) {
      // @ts-ignore
      await tweetBotChannel.send(
        `Oops! Could not find a skin matching ${anything}`
      );
      return;
    }
    tweetableSkin = await Skins.getSkinByMd5_DEPRECATED(_md5);
    if (tweetableSkin == null) {
      // @ts-ignore
      await tweetBotChannel.send(
        `Oops! Could not find a skin matching the md5 hash ${_md5}`
      );
      logger.info(`Could not find a skin matching hash ${_md5}`);
      return;
    }
    if (tweetableSkin.tweeted) {
      // @ts-ignore
      await tweetBotChannel.send(`Oops! This skin has alraedy been tweeted.`);
      return;
    }
    if (tweetableSkin.rejected) {
      // @ts-ignore
      await tweetBotChannel.send(`Oops! Can't tweet a rejected skin.`);
      return;
    }
  } else {
    tweetableSkin = await Skins.getSkinToTweet();
  }
  if (tweetableSkin == null) {
    // @ts-ignore
    await tweetBotChannel.send(
      "Oops! I ran out of skins to tweet. Could someone please `!review` some more?"
    );
    logger.info("Could not find a skin to tweet");
    return;
  }

  const { md5, canonicalFilename: filename } = tweetableSkin;
  if (filename == null) {
    throw new Error(`Could not find filename for skin with hash ${md5}`);
  }

  let output;
  try {
    output = await sendTweet(md5, filename);
  } catch (e) {
    console.error(e);
    // @ts-ignore
    await tweetBotChannel.send(`Oops. Tweeting crashed: ${e.message}`);
    return;
  }
  await Skins.markAsTweeted(md5, output.trim());
  // @ts-ignore
  await tweetBotChannel.send(output.trim());
  const remainingSkinCount = await Skins.getTweetableSkinCount();
  if (remainingSkinCount < 10) {
    // @ts-ignore
    await tweetBotChannel.send(
      `Only ${remainingSkinCount} approved skins left. Could someone please \`!review\` some more?`
    );
  }
  logger.info("Tweeted a skin", { md5, filename, url: output.trim() });
}

async function getResizedScreenshot(md5: string): Promise<Buffer> {
  const screenshot = await Skins.getScreenshotBuffer(md5);
  const { width, height } = await sharp(screenshot).metadata();

  const image = await sharp(screenshot)
    .resize(width * 2, height * 2, {
      kernel: sharp.kernel.nearest,
    })
    .toBuffer();

  return image;
}

async function sendTweet(md5: string, filename: string) {
  const screenshotBuffer = await getResizedScreenshot(md5);
  const tempFile = temp.path({ suffix: ".png" });
  fs.writeFileSync(tempFile, screenshotBuffer);
  const t = getTwitterClient();

  const { media_id_string } = await new Promise((resolve, reject) => {
    t.postMediaChunked({ file_path: tempFile }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });

  const params = {
    status: `${filename}\n\n${Skins.getMuseumUrl(md5)}`,
    media_ids: [media_id_string],
  };

  const result = await t.post("statuses/update", params);
  const id = result.data.id_str;
  if (id == null) {
    throw new Error(`Could not get id`);
  }
  return `https://twitter.com/winampskins/status/${result.data.id_str}`;
}
