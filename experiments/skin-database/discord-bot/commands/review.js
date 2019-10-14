const Skins = require("../../data/skins");
const Utils = require("../utils");

async function reviewSkin(message) {
  const skin = await Skins.getSkinToReview();
  if (skin == null) {
    throw new Error("No skins to review");
  }
  const { md5 } = skin;
  await Utils.postSkin({
    md5,
    title: filename => `Review: ${filename}`,
    dest: message.channel
  });
}

async function handler(message, args) {
  let count = args[0] || 1;
  if (count > 50) {
    message.channel.send(`You can only review up to ${count} skins at a time.`);
    message.channel.send(`Going to show ${count} skins to review`);
    count = 50;
  }
  message.channel.send(`Going to show ${count} skins to review.`);
  let i = Number(count);
  while (i--) {
    await reviewSkin(message);
  }
  if (count > 1) {
    const tweetableCount = await Skins.getTweetableSkinCount();
    message.channel.send(
      `Done reviewing ${count} skins. There are now ${tweetableCount} Tweetable skins. Thanks!`
    );
  }
}

module.exports = {
  command: "review",
  handler,
  usage: "[<number>]",
  description:
    "Post a <number> of skins to be reviewed for inclusion in the Twitter bot. Defaults to 1"
};
