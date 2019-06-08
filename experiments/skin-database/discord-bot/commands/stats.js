const { getCache } = require("../info");
const { getStats } = require("../../s3");

async function handler(message) {
  const info = getCache();
  let classic = 0;
  const { tweeted, approved, rejected } = await getStats();
  Object.values(info).forEach(skin => {
    if (skin.type === "CLASSIC") {
      classic++;
    }
  });
  await message.channel.send(`Unique Skins: ${classic.toLocaleString()}
Tweeted: ${tweeted.toLocaleString()}
Rejected: ${rejected.toLocaleString()}
Approved: ${approved.toLocaleString()}
 `);
}

module.exports = {
  command: "stats",
  handler,
  usage: "",
  description: "Give some statistics about the skin archive"
};
