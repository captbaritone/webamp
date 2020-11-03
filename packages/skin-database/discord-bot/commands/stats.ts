import { Message } from "discord.js";

import * as Skins from "../../data/skins";

async function handler(message: Message): Promise<void> {
  const classic = await Skins.getClassicSkinCount();
  const {
    tweeted,
    approved,
    rejected,
    nsfw,
    tweetable,
    webUploads,
  } = await Skins.getStats();
  await message.channel.send(`Unique Skins: ${classic.toLocaleString()}
Tweeted: ${tweeted.toLocaleString()}
Rejected: ${rejected.toLocaleString()}
NSFW: ${nsfw.toLocaleString()}
Approved: ${approved.toLocaleString()}
Tweetable: ${tweetable.toLocaleString()}
Uploaded Via Web: ${webUploads.toLocaleString()}
 `);
}

module.exports = {
  command: "stats",
  handler,
  usage: "",
  description: "Give some statistics about the skin archive",
};
