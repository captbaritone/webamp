import { ApiAction } from "./app";
import Discord, { TextChannel } from "discord.js";
import * as Config from "../config";
import SkinModel from "../data/SkinModel";
import * as DiscordUtils from "../discord-bot/utils";
import UserContext from "../data/UserContext";

export default class DiscordEventHandler {
  _clientPromise: Promise<Discord.Client>;

  constructor() {
    const _client = new Discord.Client();
    this._clientPromise = _client
      .login(Config.discordToken)
      .then(() => _client);
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
    const skin = await SkinModel.fromMd5(ctx, md5);
    if (skin == null) {
      return;
    }
    const dest = await this.getChannel(Config.NSFW_SKIN_CHANNEL_ID);
    const tweetStatus = await skin.getTweetStatus();
    if (tweetStatus === "UNREVIEWED") {
      await DiscordUtils.postSkin({
        md5,
        title: (filename) => `Review: ${filename}`,
        dest,
      });
    } else {
      await DiscordUtils.sendAlreadyReviewed({ md5, dest });
    }
  }
}
