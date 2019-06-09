const Discord = require("discord.js");
// eslint-disable-next-line
const temp = require("temp").track();
const fs = require("fs");
const fetch = require("node-fetch");
const md5Buffer = require("md5");
const Shooter = require("../../shooter");

async function handler(message) {
  console.log("Trying to take a screenshot");
  const { attachments } = message;
  if (attachments.length < 1) {
    await message.channel.send("Could not screenshot. No attachment found.");
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

  console.log("got files");
  const shooter = new Shooter("https://webamp.org");

  for (const file of files) {
    const tempFile = temp.path({ suffix: ".wsz" });
    const tempScreenshotPath = temp.path({ suffix: ".png" });

    fs.writeFileSync(tempFile, file.buffer);

    try {
      await shooter.takeScreenshot(tempFile, tempScreenshotPath, {
        minify: true
      });
    } catch (e) {
      await message.channel.send(
        `Something went wrong taking the screenshot of ${file.filename}. Sorry.`
      );
      continue;
    }

    const attachment = new Discord.Attachment(
      tempScreenshotPath,
      "screenshot.png"
    );
    const embed = new Discord.RichEmbed()
      .setTitle(`Here's a screenshot of ${file.filename}`)
      .attachFile(attachment)
      .setImage(`attachment://screenshot.png`);

    await message.channel.send(embed);
  }
  await shooter.dispose();
}

module.exports = {
  command: "screenshot",
  usage: "",
  description: "Take a screenshot of the accompanying uploaded skin",
  handler
};
