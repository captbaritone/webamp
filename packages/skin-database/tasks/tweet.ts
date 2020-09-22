import path from "path";
import logger from "../logger";
import * as Skins from "../data/skins";
import { TWEET_BOT_CHANNEL_ID } from "../config";
import { spawn } from "child_process";
import { Client } from "discord.js";
import { SkinRecord } from "../types";
import { PROJECT_ROOT } from "../config";

function spawnPromise(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const ls = spawn(command, args);
    let stdout = "";
    let stderr = "";

    ls.stdout.on("data", (data) => {
      stdout += data;
    });

    ls.stderr.on("data", (data) => {
      stderr += data;
      console.log(`stderr: ${data}`);
    });

    ls.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(stderr);
      }
    });
  });
}

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
    output = await spawnPromise(
      path.resolve(PROJECT_ROOT, "../tweetBot/tweet.py"),
      [
        "tweet",
        md5,
        filename, // "--dry",
      ]
    );
  } catch (e) {
    // @ts-ignore
    await tweetBotChannel.send(
      `Oops. The Python part of the twitter bot crashed: ${e.message}`
    );
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
  logger.info("Tweeted a skin", {
    md5,
    filename,
    url: output.trim(),
  });
}
