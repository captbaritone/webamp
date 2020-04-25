const Utils = require("../utils");
const { getRandomClassicSkinMd5 } = require("../../data/skins");

async function handler(message) {
  const md5 = await getRandomClassicSkinMd5();
  await Utils.postSkin({
    md5,
    dest: message.channel
  });
}

module.exports = {
  usage: "",
  description: "Show information about a random skin",
  command: "random",
  handler
};
