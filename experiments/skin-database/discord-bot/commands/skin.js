const Utils = require("../utils");
async function handler(message, args) {
  const [md5] = args;
  await Utils.postSkin({
    md5,
    dest: message.channel
  });
}

module.exports = {
  usage: "<md5-skin>",
  description: "Show information about a skin",
  command: "skin",
  handler
};
