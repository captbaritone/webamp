import UserContext from "./UserContext";
import { TweetRow } from "../types";

export default class TweetModel {
  constructor(readonly ctx: UserContext, readonly row: TweetRow) {}

  static async fromMd5(
    ctx: UserContext,
    md5: string
  ): Promise<TweetModel | null> {
    const row = await ctx.tweet.load(md5);
    return row == null ? null : new TweetModel(ctx, row);
  }

  getUrl(): string {
    return this.row.url;
  }
  getLikes(): number {
    return this.row.likes;
  }
  getRetweets(): number {
    return this.row.retweets;
  }
}
