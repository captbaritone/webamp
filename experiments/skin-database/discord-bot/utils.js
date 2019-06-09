const Discord = require("discord.js");
const rgbHex = require("rgb-hex");
const Skins = require("../data/skins");
const { approve, reject } = require("./s3");

const filter = reaction => {
  return ["👍", "👎"].some(name => reaction.emoji.name === name);
};

async function postSkin({ md5, title, dest }) {
  const skin = await Skins.getSkinByMd5(md5);
  const {
    canonicalFilename,
    screenshotUrl,
    skinUrl,
    webampUrl,
    averageColor,
    emails,
    tweetUrl,
    twitterLikes,
    tweetStatus,
    internetArchiveUrl,
    internetArchiveItemName,
    readmeText
  } = skin;
  console.log(skin);
  title = title ? title(canonicalFilename) : canonicalFilename;

  const embed = new Discord.RichEmbed()
    .setTitle(title)
    .addField("Try Online", `[webamp.org](${webampUrl})`, true)
    .addField("Download", `[${canonicalFilename}](${skinUrl})`, true)
    .addField("Md5", md5, true)
    .setImage(screenshotUrl);

  if (readmeText) {
    // Trim the readme since Discord will reject it otherwise.
    embed.setDescription(`\`\`\`${readmeText.slice(0, 2000)}\`\`\``);
  }
  if (averageColor) {
    try {
      const color = rgbHex(averageColor);
      if (String(color).length === 6) {
        embed.setColor(`#${color}`);
      } else {
        console.log("Did not get a safe color from ", averageColor);
        console.log("Got ", color);
      }
    } catch (e) {
      console.error("could not use color", averageColor);
    }
  }
  if (emails != null && emails.length) {
    embed.addField("Emails", emails.join(", "), true);
  }
  if (tweetUrl != null) {
    let likes = "";
    if (twitterLikes != null) {
      likes = `(${Number(twitterLikes).toLocaleString()} likes) `;
    }
    embed.addField("Tweet Status", `[Tweeted](${tweetUrl}) ${likes}🐦`, true);
  } else {
    if (tweetStatus === "UNREVIEWED") {
      embed.setFooter("React with 👍 or 👎 to approve or deny");
    }
    embed.addField("Tweet Status", getPrettyTwitterStatus(tweetStatus), true);
  }
  if (internetArchiveUrl) {
    embed.addField(
      "Internet Archive",
      `[${internetArchiveItemName || "Permalink"}](${internetArchiveUrl})`,
      true
    );
  }

  const msg = await dest.send(embed);

  await msg.awaitReactions(filter, { max: 1 }).then(async collected => {
    const vote = collected.first();
    const user = vote.users.first();
    switch (vote.emoji.name) {
      case "👍":
        await approve(md5);
        console.log(`${user.username} approved ${md5}`);
        await msg.channel.send(
          `${canonicalFilename} was approved by ${user.username}`
        );
        msg.react("✅");
        break;
      case "👎":
        await reject(md5);
        console.log(`${user.username} rejected ${md5}`);
        await msg.channel.send(
          `${canonicalFilename} was rejected by ${user.username}`
        );
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
