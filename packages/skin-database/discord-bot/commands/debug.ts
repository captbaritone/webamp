import { Message } from "discord.js";

import UserContext from "../../data/UserContext";
import SkinModel from "../../data/SkinModel";

const TRIPPLE = "```";

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
  const data = await skin.debug();
  await message.channel.send(
    [TRIPPLE, JSON.stringify(data, null, 2), TRIPPLE].join("")
  );
}

module.exports = {
  usage: "<md5-skin>",
  description: "Show debug information about a skin",
  command: "debug",
  handler,
};
