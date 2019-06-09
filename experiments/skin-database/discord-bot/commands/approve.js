const { approve, getStatus } = require("../../s3");
const Utils = require("../utils");

const { getFilename } = require("../info");
const TWEET_BOT_CHANNEL_ID = "445577489834704906";

async function handler(message, args) {
  const [md5] = args;
  const status = await getStatus(md5);
  if (status !== "UNREVIEWED") {
    await message.channel.send(`This skin has already been reviewed.`);
    return;
  }
  await approve(md5);
  const tweetBotChannel = message.client.channels.get(TWEET_BOT_CHANNEL_ID);
  await Utils.postSkin({
    md5,
    title: filename => `Approved: ${filename}`,
    dest: tweetBotChannel
  });
  await tweetBotChannel.send(
    `${filename} was approved by ${message.author.username}`
  );
}

module.exports = {
  command: "approve",
  handler,
  usage: "<md5-hash>",
  description: "Approve a given skin to be Tweeted by the Twitter bot"
};
