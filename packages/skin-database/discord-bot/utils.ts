import {
  User,
  MessageReaction,
  TextChannel,
  DMChannel,
  MessageEmbed,
} from "discord.js";
import SkinModel from "../data/SkinModel";
import * as Skins from "../data/skins";
import UserContext from "../data/UserContext";
import logger from "../logger";
import { TweetStatus } from "../types";

function isEligableToApprove(user: User): boolean {
  return !user.bot;
}

const filter = async (reaction: MessageReaction): Promise<boolean> => {
  const users = await reaction.users.fetch();
  const hasNonBot = users.some(isEligableToApprove);

  return (
    hasNonBot &&
    ["👍", "👎", "👏", "😔", "🔞"].some((name) => reaction.emoji.name === name)
  );
};

export async function postSkin({
  md5,
  title: _title,
  dest,
}: {
  md5: string;
  title?: (filename: string | null) => string;
  dest: TextChannel | DMChannel;
}) {
  const ctx = new UserContext();

  console.log("postSkin...");
  const skin = await SkinModel.fromMd5(ctx, md5);
  if (skin == null) {
    console.warn("Could not find skin for md5", { md5, alert: true });
    logger.warn("Could not find skin for md5", { md5, alert: true });
    return;
  }
  const readmeText = skin.getReadme();
  const tweet = await skin.getTweet();
  const tweetStatus = await skin.getTweetStatus();
  const iaItem = await skin.getIaItem();
  const internetArchiveUrl = iaItem?.getUrl();
  const internetArchiveItemName = iaItem?.getIdentifier();
  const emails = skin.getEmails();
  const canonicalFilename = await skin.getFileName();
  const nsfw = await skin.getIsNsfw();
  const title = _title ? _title(canonicalFilename) : canonicalFilename;

  const embed = new MessageEmbed()
    .setTitle(title)
    .addField("Try Online", `[skins.webamp.org](${skin.getMuseumUrl()})`, true)
    .addField("Download", `[${canonicalFilename}](${skin.getSkinUrl()})`, true)
    .addField("Md5", md5, true);

  if (await skin.getIsNsfw()) {
    embed.addField("NSFW", `🔞`, true);
  }

  // @ts-ignore
  if (nsfw && !(dest.type === "text" && dest.nsfw)) {
    embed.addField(
      "Screenshot",
      `[Screenshot](${skin.getScreenshotUrl()})`,
      true
    );
  } else {
    embed.setImage(skin.getScreenshotUrl());
  }

  if (readmeText) {
    // Trim the readme since Discord will reject it otherwise.
    embed.setDescription(`\`\`\`${readmeText.slice(0, 2000)}\`\`\``);
  }
  if (emails.length) {
    embed.addField("Emails", emails.join(", "), true);
  }
  if (tweet != null) {
    const likes = `${tweet.getLikes().toLocaleString()} likes `;
    const retweets = `${tweet.getRetweets().toLocaleString()} retweets `;
    embed.addField(
      "Tweet Status",
      `[Tweeted](${tweet.getUrl()}) (${likes} / ${retweets})🐦`,
      true
    );
  } else {
    if (tweetStatus === "UNREVIEWED") {
      embed.setFooter(
        "React with 👍 or 👎 to approve or deny or 🔞 to mark NSFW"
      );
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

  // @ts-ignore WAT?
  const msg = await dest.send(embed);
  if (tweetStatus !== "UNREVIEWED") {
    return;
  }

  // Don't await
  Promise.all([msg.react("👍"), msg.react("👎"), msg.react("🔞")]);
  // TODO: Timeout at some point
  await msg.awaitReactions(filter, { max: 1 }).then(async (collected) => {
    const vote = collected.first();
    if (vote == null) {
      throw new Error("Did not expect vote to be empty");
    }
    const users = await vote.users.fetch();
    const user = users.find(isEligableToApprove);
    if (user == null) {
      throw new Error("Expected to find approver.");
    }
    switch (vote.emoji.name) {
      case "👍":
      case "👏":
        await Skins.approve(ctx, md5);
        logger.info(`${user.username} approved ${md5}`);
        await msg.channel.send(
          `${canonicalFilename} was approved by ${user.username}`
        );
        msg.react("✅");
        break;
      case "😔":
      case "👎":
        await Skins.reject(ctx, md5);
        logger.info(`${user.username} rejected ${md5}`);
        await msg.channel.send(
          `${canonicalFilename} was rejected by ${user.username}`
        );
        msg.react("❌");
        break;
      case "🔞":
        logger.info(`${user.username} marked ${md5} as NSFW`);
        await Skins.markAsNSFW(ctx, md5);
        await msg.channel.send(
          `${canonicalFilename} was marked as NSFW by ${user.username}`
        );
        await Skins.reject(ctx, md5);
        logger.info(`${user.username} rejected ${md5}`);
        await msg.channel.send(
          `${canonicalFilename} was rejected by ${user.username}`
        );
        msg.react("❌");
        break;
      default:
        logger.alert(
          `Unknown skin reaction by ${user.username} on ${md5}: ${vote.emoji.name}`
        );
    }
  });
}

function getPrettyTwitterStatus(status: TweetStatus): string {
  switch (status) {
    case "APPROVED":
      return "Approved ✅";
    case "NSFW":
      return "Rejected (NSFW) ❌";
    case "REJECTED":
      return "Rejected ❌";
    case "UNREVIEWED":
      return "Unreviewed ❔";
    case "TWEETED":
      return "Tweeted 🐦";
  }
}

export async function sendAlreadyReviewed({
  md5,
  dest,
}: {
  md5: string;
  dest: TextChannel | DMChannel;
}) {
  const ctx = new UserContext();
  const skin = await SkinModel.fromMd5(ctx, md5);
  if (skin == null) {
    console.warn("Could not find skin for md5", { md5, alert: true });
    logger.warn("Could not find skin for md5", { md5, alert: true });
    return;
  }
  const canonicalFilename = await skin.getFileName();
  const tweetStatus = await skin.getTweetStatus();
  const nsfw = await skin.getIsNsfw();

  const embed = new MessageEmbed()
    .setTitle(
      `Someone flagged "${canonicalFilename}", but it's already been reviwed.`
    )
    .addField("Status", getPrettyTwitterStatus(tweetStatus), true)
    .addField("Museum", `[${canonicalFilename}](${skin.getMuseumUrl()})`, true);

  if (nsfw) {
    embed.addField("NSFW", `🔞`, true);
  }

  dest.send(embed);
}
