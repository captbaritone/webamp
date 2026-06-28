import { ApiAction } from "./types";
import Discord, { TextChannel } from "discord.js";
import * as Config from "../config";
import SkinModel from "../data/SkinModel";
import * as DiscordUtils from "../discord-bot/utils";
import UserContext from "../data/UserContext";
import logger from "../logger";

export default class DiscordEventHandler {
  _clientPromise: Promise<Discord.Client>;

  constructor() {
    logger.info("DiscordEventHandler: constructing");
    const _client = new Discord.Client();
    _client.on("ready", () => {
      logger.info("DiscordEventHandler: client ready", {
        user: _client.user?.tag,
      });
    });
    _client.on("error", (err: any) => {
      logger.error("DiscordEventHandler: client error", {
        err: err?.message,
        stack: err?.stack,
      });
    });
    _client.on("disconnect", (event: any) => {
      logger.warn("DiscordEventHandler: client disconnect", { event });
    });
    _client.on("reconnecting", () => {
      logger.warn("DiscordEventHandler: client reconnecting");
    });
    _client.on("shardError", (err: any) => {
      logger.error("DiscordEventHandler: shard error", {
        err: err?.message,
        stack: err?.stack,
      });
    });
    _client.on("messageReactionAdd", (reaction: any, user: any) => {
      logger.info("DiscordEventHandler: messageReactionAdd", {
        emoji: reaction?.emoji?.name,
        msgId: reaction?.message?.id,
        channelId: reaction?.message?.channel?.id,
        userId: user?.id,
        username: user?.username,
        userIsBot: user?.bot,
      });
    });
    this._clientPromise = _client
      .login(Config.discordToken)
      .then(() => _client)
      .catch((err) => {
        logger.error("DiscordEventHandler: login failed", {
          err: err?.message,
          stack: err?.stack,
        });
        throw err;
      });
  }

  async dispose() {
    const client = await this._clientPromise;
    client.destroy();
  }

  private async getClient() {
    return this._clientPromise;
  }

  private async getChannel(channelId: string): Promise<TextChannel> {
    const client = await this.getClient();
    const dest = (await client.channels.fetch(channelId)) as TextChannel | null;
    if (dest == null) {
      throw new Error(`Could not get channel with id: ${channelId}`);
    }
    return dest;
  }

  async handle(action: ApiAction): Promise<void> {
    const actionMd5 = "md5" in action ? action.md5 : undefined;
    logger.info("DiscordEventHandler.handle: entry", {
      type: action.type,
      md5: actionMd5,
    });
    try {
      await this._handle(action);
    } catch (err: any) {
      logger.error("DiscordEventHandler.handle: failed", {
        type: action.type,
        md5: actionMd5,
        err: err?.message,
        stack: err?.stack,
      });
    }
  }

  private async _handle(action: ApiAction): Promise<void> {
    const ctx = new UserContext();
    switch (action.type) {
      case "REVIEW_REQUESTED":
        await this.requestReview(action.md5, ctx);
        break;
      case "APPROVED_SKIN":
        await this.reportSkin(
          action.md5,
          ctx,
          (filename) => `Approved by ${ctx.username}: ${filename}`
        );
        break;
      case "REJECTED_SKIN":
        await this.reportSkin(
          action.md5,
          ctx,
          (filename) => `Rejected by ${ctx.username}: ${filename}`
        );
        break;
      case "MARKED_SKIN_NSFW":
        await this.reportSkin(
          action.md5,
          ctx,
          (filename) => `Marked NSFW by ${ctx.username}: ${filename}`,
          Config.NSFW_SKIN_CHANNEL_ID
        );
        break;
      case "CLASSIC_SKIN_UPLOADED":
        await this.reportSkin(
          action.md5,
          ctx,
          (filename) => `New skin uploaded: ${filename}`,
          Config.SKIN_UPLOADS_CHANNEL_ID
        );
        break;
      case "MODERN_SKIN_UPLOADED": {
        const dest = await this.getChannel(Config.SKIN_UPLOADS_CHANNEL_ID);
        await dest.send(`Someone uploaded a new modern skin: ${action.md5}`);
        break;
      }

      case "SKIN_UPLOAD_ERROR": {
        const dest = await this.getChannel(Config.SKIN_UPLOADS_CHANNEL_ID);
        await dest.send(
          `Encountered an error processing upload ${action.uploadId}: ${action.message}`
        );
        break;
      }
      case "GOT_FEEDBACK": {
        const dest = await this.getChannel(Config.FEEDBACK_SKIN_CHANNEL_ID);
        const userMessage = action.message
          .split("\n")
          .map((line) => {
            return `> ${line}`;
          })
          .join("\n");
        let message = `Feedback:\n\n ${userMessage}`;
        if (action.email != null) {
          message += `\n\n--${action.email}`;
        }
        if (action.url != null) {
          message += `\n(${action.url})`;
        }

        await dest.send(message);
        break;
      }

      case "SYNCED_TO_ARCHIVE": {
        const dest = await this.getChannel(Config.SKIN_UPLOADS_CHANNEL_ID);

        const message = `Synced skins to archive.org. Success: ${action.successes.toLocaleString()} Errors: ${action.errors.toLocaleString()} Skipped: ${action.skips.toLocaleString()}.`;

        await dest.send(message);
        break;
      }

      case "STARTED_SYNC_TO_ARCHIVE": {
        const dest = await this.getChannel(Config.SKIN_UPLOADS_CHANNEL_ID);

        const message = `Starting sync to archive.org. Found ${action.count.toLocaleString()} to sync.`;

        await dest.send(message);
        break;
      }
      case "POPULAR_TWEET": {
        const dest = await this.getChannel(Config.POPULAR_TWEETS_CHANNEL_ID);
        const diff = Date.now() - Number(action.date);
        const seconds = diff / 1000;
        const minutes = seconds / 60;
        const hours = Math.round(minutes / 60);

        const message = `⭐️ This tweet passed **${action.bracket}** likes! (**${action.likes}** likes in **${hours}** hours)️ ⭐\n\n${action.url}`;

        await dest.send(message);
        break;
      }
      case "TWEET_BOT_MILESTONE": {
        const dest = await this.getChannel(Config.POPULAR_TWEETS_CHANNEL_ID);
        const message = `🎉 Tweet Bot Milestone! Just passed ${action.bracket.toLocaleString()} Followers 🎉`;
        await dest.send(message);
        break;
      }
    }
  }

  private async reportSkin(
    md5: string,
    ctx: UserContext,
    getFilename: (filename: string) => string,
    channelId = Config.SKIN_REVIEW_CHANNEL_ID
  ) {
    const skin = await SkinModel.fromMd5(ctx, md5);
    if (skin == null) {
      return;
    }
    const dest = await this.getChannel(channelId);
    await DiscordUtils.postSkin({
      md5,
      title: getFilename,
      dest,
    });
  }

  private async requestReview(md5: string, ctx: UserContext) {
    logger.info("requestReview: entry", { md5 });
    const skin = await SkinModel.fromMd5(ctx, md5);
    if (skin == null) {
      logger.warn("requestReview: skin not found", { md5 });
      return;
    }
    const dest = await this.getChannel(Config.NSFW_SKIN_CHANNEL_ID);
    const tweetStatus = await skin.getTweetStatus();
    logger.info("requestReview: resolved", {
      md5,
      tweetStatus,
      channelId: Config.NSFW_SKIN_CHANNEL_ID,
    });
    if (tweetStatus === "UNREVIEWED") {
      await DiscordUtils.postSkin({
        md5,
        title: (filename) => `Review: ${filename}`,
        dest,
        source: "graphql:request_nsfw_review_for_skin",
      });
    } else {
      logger.info("requestReview: skipping post, already reviewed", {
        md5,
        tweetStatus,
      });
      // Too much nosie
      // await DiscordUtils.sendAlreadyReviewed({ md5, dest });
    }
  }
}
