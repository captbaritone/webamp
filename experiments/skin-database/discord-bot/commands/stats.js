const { getStats, getClassicSkinCount } = require("../../data/skins");

async function handler(message) {
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
  description: "Give some statistics about the skin archive"
};
