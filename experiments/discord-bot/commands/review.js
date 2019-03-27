const { getSkinToReview } = require("../s3");
const Utils = require("../utils");

async function reviewSkin(message) {
  const { filename, md5 } = await getSkinToReview();
  await Utils.postSkin({
    filename,
    md5,
    title: `Review: ${filename}`,
    dest: message.client.channels
  });
}

async function handler(message, args) {
  const [arg1] = args;
  const count = arg1 ? Math.min(arg1, 10) : 1;
  if (count > 1) {
    message.channel.send(`Going to show ${count} skins to review`);
  }
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
