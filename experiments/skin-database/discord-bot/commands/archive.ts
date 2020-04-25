import { Message } from "discord.js";
import fetch from "node-fetch";
import * as Utils from "../utils";
import { addSkinFromBuffer } from "../../addSkin";

async function handler(message: Message) {
  const { attachments } = message;
  if (attachments.array().length < 1) {
    await message.channel.send("Could not archive. No attachment found.");
    return;
  }
  const files = await Promise.all(
    attachments.map(async (attachment) => {
      const { filename, url } = attachment;
      const response = await fetch(url);
      console.log("got response");
      const buffer = await response.buffer();
      console.log("got buffer");
      return { filename, buffer };
    })
  );

  for (const file of files) {
    let result;
    try {
      result = await addSkinFromBuffer(
        file.buffer,
        file.filename,
        message.author.username
      );
    } catch (e) {
      console.error(e);
      message.channel.send(
        "There was an error archiving your skin. Please ping @captbaritone."
      );
      throw e;
    }
    if (result.status === "FOUND") {
      await message.channel.send(`This skin is already in our collection.`);
    } else if (result.status === "ADDED") {
      await message.channel.send(
        `Thanks! ${file.filename} is a brand new skin. 👏 It has been queued for archiving. In the mean time, here's a screenshot and a link to it on Webamp.`
      );
    }
    await Utils.postSkin({ md5: result.md5, dest: message.channel });
  }
}

module.exports = {
  command: "archive",
  usage: "",
  description:
    "Queues the accompanying uploaded skin for inclusion in the Archive",
  handler,
};
