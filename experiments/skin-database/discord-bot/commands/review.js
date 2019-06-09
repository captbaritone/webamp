const { getSkinToReview } = require("../../s3");
const Utils = require("../utils");

async function reviewSkin(message) {
  const { md5 } = await getSkinToReview();
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
    message.channel.send(`Done reviewing ${count} skins. Thanks!`);
  }
}

module.exports = {
  command: "review",
  handler,
  usage: "[<number>]",
  description:
    "Post a <number> of skins to be reviewed for inclusion in the Twitter bot. Defaults to 1"
};
