import * as Utils from "../utils";
import { Message } from "discord.js";
import { getRandomClassicSkinMd5 } from "../../data/skins";

async function handler(message: Message): Promise<void> {
  const md5 = await getRandomClassicSkinMd5();
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
