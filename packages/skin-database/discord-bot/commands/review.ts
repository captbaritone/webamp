import * as Skins from "../../data/skins";
import * as Utils from "../utils";
import { Message } from "discord.js";

async function reviewSkin(message: Message): Promise<void> {
  const skin = await Skins.getSkinToReview();
  if (skin == null) {
    throw new Error("No skins to review");
  }
  const { md5 } = skin;
  await Utils.postSkin({
    md5,
    title: (filename) => `Review: ${filename}`,
    dest: message.channel,
  });
}

async function handler(message: Message, args: [string, string]) {
  let count = Number(args[0] || 1);
  if (count > 50) {
    await message.channel.send(
      `You can only review up to ${count} skins at a time.`
    );
    count = 50;
  }
  await message.channel.send(`Going to show ${count} skins to review.`);
  let i = count;
  while (i--) {
    await reviewSkin(message);
  }
  if (count > 1) {
    const tweetableCount = await Skins.getTweetableSkinCount();
    await message.channel.send(
      `Done reviewing ${count} skins. There are now ${tweetableCount} Tweetable skins. Thanks!`
    );
  } else {
    await message.channel.send(`Thanks!`);
  }
}

module.exports = {
  command: "review",
  handler,
  usage: "[<number>]",
  description:
    "Post a <number> of skins to be reviewed for inclusion in the Twitter bot. Defaults to 1",
};
