const { getFilename } = require("../info");
const Utils = require("../utils");
async function handler(message, args) {
  const [md5] = args;
  const filename = getFilename(md5);
  await Utils.postSkin({
    filename,
    md5,
    title: `${filename}`,
    dest: message.channel
  });
}

module.exports = {
  usage: "<md5-skin>",
  description: "Show information about a skin",
  command: "skin",
  handler
};
