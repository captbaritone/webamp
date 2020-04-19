const fs = require("fs");
const fetch = require("node-fetch");
const md5Buffer = require("md5");
const Skins = require("../../data/skins");
const Utils = require("../utils");
const S3 = require("../../s3");
const Shooter = require("../../shooter");
const temp = require("temp").track();

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

  // TODO
  // Extract the readme
  // Extract the emails
  // Extract the average color
  // Upload to Internet Archive
  // Store the Internet Archive item name
  // Construct IA Webamp URL
  const shooter = new Shooter("https://webamp.org");

  for (const file of files) {
    const skin = await Skins.getSkinByMd5(file.md5);
    if (skin != null) {
      await message.channel.send(`This skin is already in our collection.`);
      await Utils.postSkin({
        md5: file.md5,
        dest: message.channel,
      });
    } else {
      await message.channel.send(
        `Thanks! ${file.filename} is a brand new skin. 👏 Uploading to our server and taking a screenshot...`
      );
      const tempFile = temp.path({ suffix: ".wsz" });
      fs.writeFileSync(tempFile, file.buffer);
      const tempScreenshotPath = temp.path({ suffix: ".png" });

      try {
        await shooter.takeScreenshot(tempFile, tempScreenshotPath, {
          minify: true,
        });
      } catch (e) {
        console.error(e);
        await message.channel.send(
          `Something went wrong taking the screenshot of ${file.filename}. Sorry.`
        );
        continue;
      }

      await S3.putScreenshot(file.md5, fs.readFileSync(tempScreenshotPath));
      await S3.putSkin(file.md5, file.buffer);
      await Skins.addSkin({
        md5: file.md5,
        filePath: file.filename,
        uploader: message.author.username,
      });
      await message.channel.send(
        `Done! ${file.filename} has been queued for archiving. In the mean time, here's a screenshot and a link to it on Webamp.`
      );
      await Utils.postSkin({
        md5: file.md5,
        dest: message.channel,
      });
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
