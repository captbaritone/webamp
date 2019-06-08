const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const md5Buffer = require("md5");
const config = require("../../config");

const { getInfo } = require("../info");
const Skin = require("./skin");

async function handler(message) {
  const { attachments } = message;
  if (attachments.length < 1) {
    await message.channel.send("Could not archive. No attachment found.");
    return;
  }
  const files = await Promise.all(
    attachments.map(async attachment => {
      const { filename, url } = attachment;
      const response = await fetch(url);
      console.log("got response");
      const buffer = await response.buffer();
      console.log("got buffer");
      const md5 = md5Buffer(buffer);
      console.log("got md5", md5);
      return { filename, buffer, md5 };
    })
  );

  for (const file of files) {
    const info = await getInfo(file.md5);
    if (info == null) {
      fs.writeFileSync(
        path.join(
          config.uploadDir,
          // TODO: Use a sub directory using md5 to avoid collision
          // file.md5,
          file.filename
        ),
        file.buffer
      );
      await message.channel.send(
        `Thanks! ${
          file.filename
        } is a brand new skin. 👏 It has been queued for archiving.`
      );
    } else {
      await message.channel.send(
        `We already have ${file.filename} in our collection`
      );
      await Skin.handler(message, [file.md5]);
    }
  }
}

module.exports = {
  command: "archive",
  usage: "",
  description:
    "Queues the accompanying uploaded skin for inclusion in the Archive",
  handler
};
