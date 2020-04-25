import { Message } from "discord.js";
const { approve, getStatus } = require("../../data/skins");
const Utils = require("../utils");
const { TWEET_BOT_CHANNEL_ID } = require("../../config");

async function handler(message: Message, args: [string]) {
  const [md5] = args;
  const status = await getStatus(md5);
  if (status !== "UNREVIEWED") {
    await message.channel.send(`This skin has already been reviewed.`);
    return;
  }
  await approve(md5);
  const tweetBotChannel = message.client.channels.get(TWEET_BOT_CHANNEL_ID);
  if (tweetBotChannel == null) {
    throw new Error("Could not find tweet-bot channel");
  }
  let filename = null;
  await Utils.postSkin({
    md5,
    title: (f) => {
      // Hack to get access to the file name
      filename = f;
      return `Approve: ${f}`;
    },
    dest: tweetBotChannel,
  });
  if (tweetBotChannel.type !== "text") {
    throw new Error("User tried to approve a skin from a non-text channel");
  }
  // TODO: Upgrade and see if types improve
  await tweetBotChannel.send(
    `${filename} was approved by ${message.author.username}`
  );
}

module.exports = {
  command: "approve",
  handler,
  usage: "<md5-hash>",
  description: "Approve a given skin to be Tweeted by the Twitter bot",
};
