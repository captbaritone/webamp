const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const md5Buffer = require("md5");
const config = require("../../config");
const Skins = require("../../data/skins");
const Utils = require("../utils");

async function handler(message) {
  const { attachments } = message;
  if (attachments.length < 1) {
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
      const md5 = md5Buffer(buffer);
      console.log("got md5", md5);
      return { filename, buffer, md5 };
    })
  );

  // Compute MD5
  // Upload to S3
  // Record the filepath
  // Take a screenshot
  // Upload screenshot to S3
  // Extract the readme
  // Extract the emails
  // Extract the average color
  // Upload to Internet Archive
  // Store the Internet Archive item name
  // Construct IA Webamp URL

  for (const file of files) {
    const skin = await Skins.getSkinByMd5(file.md5);
    if (skin != null) {
      await message.channel.send(`This skin is already in our collection.`);
      await Utils.postSkin({
        md5: file.md5,
        dest: message.channel,
      });
    } else {
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
        `Thanks! ${file.filename} is a brand new skin. 👏 It has been queued for archiving.`
      );
    }
  }
}

module.exports = {
  command: "archive",
  usage: "",
  description:
    "Queues the accompanying uploaded skin for inclusion in the Archive",
  handler,
};
