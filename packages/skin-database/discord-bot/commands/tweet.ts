import { Message } from "discord.js";

import { tweet } from "../../tasks/tweet";
import { CAPTBARITONE_USER_ID } from "../../config";

async function handler(message: Message, args: [string]) {
  const [anything] = args;
  if (message.author.id !== CAPTBARITONE_USER_ID) {
    await message.channel.send(
      `Currently only @captbaritone can use this command`
    );
    return;
  }
  await tweet(message.client, anything || null);
}

module.exports = {
  command: "tweet",
  handler,
  usage: "[<md5>]",
  description: "Tweet an approved skin",
};
