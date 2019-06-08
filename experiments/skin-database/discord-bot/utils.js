const Discord = require("discord.js");
const rgbHex = require("rgb-hex");
const { getInfo } = require("./info");
const { approve, reject, getStatus } = require("./s3");

const filter = reaction => {
  return ["👍", "👎"].some(name => reaction.emoji.name === name);
};

async function postSkin({ filename, md5, title, dest }) {
  const screenshotUrl = `https://s3.amazonaws.com/webamp-uploaded-skins/screenshots/${md5}.png`;
  const skinUrl = `https://s3.amazonaws.com/webamp-uploaded-skins/skins/${md5}.wsz`;
  const webampUrl = `https://webamp.org?skinUrl=${skinUrl}`;

  const embed = new Discord.RichEmbed()
    .setTitle(title)
    .addField("Try Online", `[webamp.org](${webampUrl})`, true)
    .addField("Download", `[${filename}](${skinUrl})`, true)
    .addField("Md5", md5, true)
    .setImage(screenshotUrl);

  const info = getInfo(md5);
  if (info == null) {
    embed.addField("Warning", "Cached metadata not found", true);
  } else {
    if (info.averageColor) {
      try {
        const color = rgbHex(info.averageColor);
        if (String(color).length === 6) {
          embed.setColor(`#${color}`);
        } else {
          console.log("Did not get a safe color from ", info.averageColor);
          console.log("Got ", color);
        }
      } catch (e) {
        console.error("could not use color", info.averageColor);
      }
    }
    if (info.emails != null && info.emails.length) {
      const uniqueEmails = Array.from(new Set(info.emails));
      // TODO: Fix email parsing
      embed.addField("Emails", uniqueEmails.join(", "), true);
    }
    if (info.tweetUrl != null) {
      let likes = "";
      if (info.twitterLikes != null) {
        likes = `(${Number(info.twitterLikes).toLocaleString()} likes) `;
      }
      embed.addField(
        "Tweet Status",
        `[Tweeted](${info.tweetUrl}) ${likes}🐦`,
        true
      );
    } else {
      const status = await getStatus(md5);
      if (status === "UNREVIEWED") {
        embed.setFooter("React with 👍 or 👎 to approve or deny");
      }
      embed.addField("Tweet Status", getPrettyTwitterStatus(status), true);
    }
  }

  const msg = await dest.send(embed);

  await msg.awaitReactions(filter, { max: 1 }).then(async collected => {
    const vote = collected.first();
    const user = vote.users.first();
    switch (vote.emoji.name) {
      case "👍":
        await approve(md5);
        console.log(`${user.username} approved ${md5}`);
        await msg.channel.send(`${filename} was approved by ${user.username}`);
        msg.react("✅");
        break;
      case "👎":
        await reject(md5);
        console.log(`${user.username} rejected ${md5}`);
        await msg.channel.send(`${filename} was rejected by ${user.username}`);
        msg.react("❌");
        break;
    }
  });
}

function getPrettyTwitterStatus(status) {
  switch (status) {
    case "APPROVED":
      return "Approved ✅";
    case "REJECTED":
      return "Rejected ❌";
    case "UNREVIEWED":
      return "Unreviewed ❔";
    case "TWEETED":
      return "Tweeted 🐦";
  }
}

module.exports = { postSkin };
