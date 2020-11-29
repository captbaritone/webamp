import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { TweetRow } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";

export type TweetDebugData = {
  row: TweetRow;
};

export default class TweetModel {
  constructor(readonly ctx: UserContext, readonly row: TweetRow) {}

  static async fromMd5(ctx: UserContext, md5: string): Promise<TweetModel[]> {
    const rows = await getTweetsLoader(ctx).load(md5);
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

const getTweetsLoader = ctxWeakMapMemoize<DataLoader<string, TweetRow[]>>(
  () =>
    new DataLoader(async (md5s) => {
      const rows = await knex("tweets").whereIn("skin_md5", md5s).select();
      return md5s.map((md5) => rows.filter((x) => x.skin_md5 === md5));
    })
);
