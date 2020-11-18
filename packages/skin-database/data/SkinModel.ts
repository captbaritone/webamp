import path from "path";
import { getScreenshotUrl, getSkinUrl } from "./skins";
import { TweetStatus, SkinRow, TweetRow, ReviewRow, FileRow } from "../types";
import UserContext from "./UserContext";
import TweetModel, { TweetDebugData } from "./TweetModel";
import IaItemModel from "./IaItemModel";
import FileModel, { FileDebugData } from "./FileModel";

export default class SkinModel {
  constructor(readonly ctx: UserContext, readonly row: SkinRow) {}

  static async fromMd5(
    ctx: UserContext,
    md5: string
  ): Promise<SkinModel | null> {
    const row = await ctx.skin.load(md5);
    return row == null ? null : new SkinModel(ctx, row);
  }

  static async exists(ctx: UserContext, md5: string): Promise<boolean> {
    const row = await ctx.skin.load(md5);
    return row != null;
  }

  async tweeted(): Promise<boolean> {
    return (await this.getTweet()) != null;
  }

  async getTweet(): Promise<TweetModel | null> {
    const tweets = await this.getTweets();
    return tweets[0] || null;
  }

  async getTweets(): Promise<TweetModel[]> {
    const rows = await this.ctx.tweets.load(this.row.md5);
    return rows.map((row) => new TweetModel(this.ctx, row));
  }

  getIaItem(): Promise<IaItemModel | null> {
    return IaItemModel.fromMd5(this.ctx, this.row.md5);
  }

  getReviews(): Promise<ReviewRow[]> {
    return this.ctx.reviews.load(this.row.md5);
  }

  getFiles(): Promise<FileModel[]> {
    return FileModel.fromMd5(this.ctx, this.row.md5);
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

  async getFileName(): Promise<string> {
    const files = await this.getFiles();
    if (files.length === 0) {
      throw new Error(`Could not find file for skin with md5 ${this.getMd5()}`);
    }
    return files[0].getFileName();
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
    return `https://skins.webamp.org/skin/${this.row.md5}`;
  }
  getWebampUrl(): string {
    return `https://webamp.org?skinUrl=${this.getSkinUrl()}`;
  }
  getScreenshotUrl(): string {
    return getScreenshotUrl(this.row.md5);
  }
  getSkinUrl(): string {
    return getSkinUrl(this.row.md5);
  }

  async debug(): Promise<{
    row: SkinRow;
    reviews: ReviewRow[];
    tweets: TweetDebugData[];
    files: FileDebugData[];
  }> {
    const tweets = await this.getTweets();
    const files = await this.getFiles();
    return {
      row: this.row,
      reviews: await this.getReviews(),
      tweets: await Promise.all(tweets.map((tweet) => tweet.debug())),
      files: await Promise.all(files.map((file) => file.debug())),
    };
  }
}
