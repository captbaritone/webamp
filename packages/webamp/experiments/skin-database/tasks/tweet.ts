import path from "path";
import logger from "../logger";
import * as Skins from "../data/skins";
import { TWEET_BOT_CHANNEL_ID } from "../config";
import { spawn } from "child_process";
import { Client } from "discord.js";

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
        reject({ stdout, stderr });
      }
    });
  });
}

export async function tweet(discordClient: Client) {
  const tweetBotChannel = discordClient.channels.get(TWEET_BOT_CHANNEL_ID);
  if (tweetBotChannel == null) {
    throw new Error("Could not connect to the #tweet-bot channel");
  }
  const tweetableSkin = await Skins.getSkinToTweet();
  if (tweetableSkin == null) {
    // @ts-ignore
    await tweetBotChannel.send(
      "Oops! I ran out of skins to tweet. Could someone please `!review` some more?"
    );
    logger.info("Could not find a skin to tweet");
    return;
  }

  const { md5, filename } = tweetableSkin;
  if (filename == null) {
    throw new Error(`Could not find filename for skin with hash ${md5}`);
  }
  const output = await spawnPromise(
    // This will be run from the dist directory
    path.resolve(__dirname, "../../../tweetBot/tweet.py"),
    [
      "tweet",
      md5,
      filename,
      // "--dry",
    ]
  );
  await Skins.markAsTweeted(md5);
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
