const Utils = require("../utils");
const Skins = require("../../data/skins");

async function handler(message, args) {
  const [anything] = args;
  const md5 = await Skins.getMd5ByAnything(anything);
  if (md5 == null) {
    message.channel.send(`Could not find a skin matching ${anything}`);
  }
  await Utils.postSkin({
    md5,
    dest: message.channel,
  });
}

module.exports = {
  usage: "<md5-skin>",
  description: "Show information about a skin",
  command: "skin",
  handler,
};
