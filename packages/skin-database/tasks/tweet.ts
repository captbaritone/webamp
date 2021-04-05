import logger from "../logger";
import fs from "fs";
import * as Skins from "../data/skins";
import { TWEET_BOT_CHANNEL_ID } from "../config";
import { Client } from "discord.js";
import _temp from "temp";
import sharp from "sharp";
import { getTwitterClient } from "../twitter";
import SkinModel from "../data/SkinModel";
import UserContext from "../data/UserContext";
import TweetModel from "../data/TweetModel";
const temp = _temp.track();

export async function tweet(discordClient: Client, anything: string | null) {
  const ctx = new UserContext();
  const tweetBotChannel = await discordClient.channels.fetch(
    TWEET_BOT_CHANNEL_ID
  );
  if (tweetBotChannel == null) {
    throw new Error("Could not connect to the #tweet-bot channel");
  }
  let tweetableSkin: null | SkinModel = null;
  if (anything != null) {
    tweetableSkin = await SkinModel.fromAnything(ctx, anything);
    if (tweetableSkin == null) {
      // @ts-ignore
      await tweetBotChannel.send(
        `Oops! Could not find a skin matching ${anything}`
      );
      return;
    }
    const tweetStatus = await tweetableSkin.getTweetStatus();
    if (tweetStatus == "TWEETED") {
      // @ts-ignore
      await tweetBotChannel.send(`Oops! This skin has alraedy been tweeted.`);
      return;
    }
    if (tweetStatus == "REJECTED" || tweetStatus == "NSFW") {
      // @ts-ignore
      await tweetBotChannel.send(`Oops! Can't tweet a rejected skin.`);
      return;
    }
  } else {
    const toTweet = await Skins.getSkinToTweet();
    tweetableSkin =
      toTweet == null ? null : await SkinModel.fromMd5(ctx, toTweet.md5);
  }
  if (tweetableSkin == null) {
    // @ts-ignore
    await tweetBotChannel.send(
      "Oops! I ran out of skins to tweet. Could someone please `!review` some more?"
    );
    logger.info("Could not find a skin to tweet");
    return;
  }

  const filename = await tweetableSkin.getFileName();
  const md5 = tweetableSkin.getMd5();

  if (filename == null) {
    throw new Error(`Could not find filename for skin with hash ${md5}`);
  }

  let tweetId;
  try {
    tweetId = await sendTweet(tweetableSkin);
  } catch (e) {
    console.error(e);
    // @ts-ignore
    await tweetBotChannel.send(`Oops. Tweeting crashed: ${e.message}`);
    return;
  }
  await Skins.markAsTweeted(tweetableSkin.getMd5(), tweetId);

  const tweet = await TweetModel.fromTweetId(ctx, tweetId);
  if (tweet == null) {
    throw new Error(`Could not locate tweet with ID "${tweetId}"`);
  }
  // @ts-ignore
  await tweetBotChannel.send(tweet?.getUrl());
  const remainingSkinCount = await Skins.getTweetableSkinCount();
  if (remainingSkinCount < 10) {
    // @ts-ignore
    await tweetBotChannel.send(
      `Only ${remainingSkinCount} approved skins left. Could someone please \`!review\` some more?`
    );
  }
  logger.info("Tweeted a skin", { md5, filename, tweetId });
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

async function sendTweet(skin: SkinModel): Promise<string> {
  const screenshotBuffer = await getResizedScreenshot(skin.getMd5());
  const filename = await skin.getFileName();
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
    status: `${filename}\n\n${skin.getMuseumUrl()}`,
    media_ids: [media_id_string],
  };

  const result = await t.post("statuses/update", params);
  const id = result.data.id_str;
  if (id == null) {
    throw new Error(`Could not get id`);
  }
  return id;
}
