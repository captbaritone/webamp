import { Message } from "discord.js";

import * as Utils from "../utils";
import * as Skins from "../../data/skins";

async function handler(message: Message, args: [string]) {
  const [anything] = args;
  if (anything == null) {
    message.channel.send(`<md5-skin> is required.`);
    return;
  }
  const md5 = await Skins.getMd5ByAnything(anything);
  if (md5 == null) {
    message.channel.send(`Could not find a skin matching ${anything}`);
    return;
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
