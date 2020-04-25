import { Message } from "discord.js";

import tweet from "../../tasks/tweet";
import { CAPTBARITONE_USER_ID } from "../../config";

async function handler(message: Message): Promise<void> {
  if (message.author.id !== CAPTBARITONE_USER_ID) {
    await message.channel.send(
      `Currently only @captbaritone can use this command`
    );
    return;
  }
  await tweet(message.client);
}

module.exports = {
  command: "tweet",
  handler,
  usage: "",
  description: "Tweet an approved skin",
};
