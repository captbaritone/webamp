import { Message } from "discord.js";

import * as Utils from "../utils";
import UserContext from "../../data/UserContext";
import SkinModel from "../../data/SkinModel";

async function handler(message: Message, args: [string]) {
  const ctx = new UserContext();
  const [anything] = args;
  if (anything == null) {
    message.channel.send(`<md5-skin> is required.`);
    return;
  }
  const skin = await SkinModel.fromAnything(ctx, anything);
  if (skin == null) {
    message.channel.send(`Could not find a skin matching ${anything}`);
    return;
  }
  await Utils.postSkin({
    md5: skin.getMd5(),
    dest: message.channel,
  });
}

module.exports = {
  usage: "<md5-skin>",
  description: "Show information about a skin",
  command: "skin",
  handler,
};
