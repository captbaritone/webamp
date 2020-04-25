import { Message } from "discord.js";

import { getStats, getClassicSkinCount } from "../../data/skins";

async function handler(message: Message): Promise<void> {
  let classic = await getClassicSkinCount();
  const { tweeted, approved, rejected, tweetable } = await getStats();
  await message.channel.send(`Unique Skins: ${classic.toLocaleString()}
Tweeted: ${tweeted.toLocaleString()}
Rejected: ${rejected.toLocaleString()}
Approved: ${approved.toLocaleString()}
Tweetable: ${tweetable.toLocaleString()}
 `);
}

module.exports = {
  command: "stats",
  handler,
  usage: "",
  description: "Give some statistics about the skin archive",
};
