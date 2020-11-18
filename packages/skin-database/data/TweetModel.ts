import UserContext from "./UserContext";
import { TweetRow } from "../types";

export type TweetDebugData = {
  row: TweetRow;
};

export default class TweetModel {
  constructor(readonly ctx: UserContext, readonly row: TweetRow) {}

  static async fromMd5(ctx: UserContext, md5: string): Promise<TweetModel[]> {
    const rows = await ctx.tweets.load(md5);
    return rows.map((row) => new TweetModel(ctx, row));
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

  async debug(): Promise<TweetDebugData> {
    return {
      row: this.row,
    };
  }
}
