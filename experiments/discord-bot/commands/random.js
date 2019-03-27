const Utils = require("../utils");

const { getCache, getFilename } = require("../info");

async function handler(message) {
  const cache = getCache();
  const skins = Object.values(cache).filter(skin => skin.type === "CLASSIC");
  const skin = skins[Math.floor(Math.random() * skins.length)];
  const { md5 } = skin;
  const filename = getFilename(md5);
  await Utils.postSkin({
    filename,
    md5,
    title: `${filename}`,
    dest: message.channel
  });
}

module.exports = {
  usage: "",
  description: "Show information about a random skin",
  command: "random",
  handler
};
