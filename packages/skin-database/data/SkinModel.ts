import path from "path";
import {
  getMuseumUrl,
  getWebampUrl,
  getScreenshotUrl,
  getSkinUrl,
} from "./skins";
import { TweetStatus, SkinRow, TweetRow, ReviewRow, FileRow } from "../types";
import UserContext from "./UserContext";
import TweetModel from "./TweetModel";
import IaItemModel from "./IaItemModel";

export default class SkinModel {
  constructor(readonly ctx: UserContext, readonly row: SkinRow) {}

  static async fromMd5(
    ctx: UserContext,
    md5: string
  ): Promise<SkinModel | null> {
    const row = await ctx.skin.load(md5);
    return row == null ? null : new SkinModel(ctx, row);
  }

  async tweeted(): Promise<boolean> {
    return (await this.getTweet()) != null;
  }

  getTweet(): Promise<TweetModel | null> {
    return TweetModel.fromMd5(this.ctx, this.row.md5);
  }

  getIaItem(): Promise<IaItemModel | null> {
    return IaItemModel.fromMd5(this.ctx, this.row.md5);
  }

  getReviews(): Promise<ReviewRow[]> {
    return this.ctx.reviews.load(this.row.md5);
  }

  getFile(): Promise<FileRow> {
    return this.ctx.file.load(this.row.md5);
  }

  async getIsNsfw(): Promise<boolean> {
    const reviews = await this.getReviews();
    return reviews.some((review) => review.review === "NSFW");
  }

  async getTweetStatus(): Promise<TweetStatus> {
    const tweet = await this.getTweet();
    if (tweet != null) {
      "TWEETED";
    }
    const reviewRows = await this.getReviews();
    const reviews = new Set(reviewRows.map((row) => row.review));
    if (reviews.has("REJECTED")) {
      return "REJECTED";
    }
    if (reviews.has("APPROVED")) {
      return "APPROVED";
    }

    return "UNREVIEWED";
  }

  async getFilename(): Promise<string> {
    const file = await this.getFile();
    return path.basename(file.file_path);
  }

  getMd5(): string {
    return this.row.md5;
  }

  getEmails(): string[] {
    const { emails } = this.row;
    return emails ? emails.split(" ") : [];
  }

  getReadme(): string | null {
    return this.row.readme_text || null;
  }

  getMuseumUrl(): string {
    return getMuseumUrl(this.row.md5);
  }
  getWebampUrl(): string {
    return getWebampUrl(this.row.md5);
  }
  getScreenshotUrl(): string {
    return getScreenshotUrl(this.row.md5);
  }
  getSkinUrl(): string {
    return getSkinUrl(this.row.md5);
  }
}
