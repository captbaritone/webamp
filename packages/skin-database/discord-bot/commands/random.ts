import * as Utils from "../utils";
import { Message } from "discord.js";
import * as Skins from "../../data/skins";

async function handler(message: Message): Promise<void> {
  const md5 = await Skins.getRandomClassicSkinMd5();
  await Utils.postSkin({
    md5,
    dest: message.channel,
  });
}

module.exports = {
  usage: "",
  description: "Show information about a random skin",
  command: "random",
  handler,
};
