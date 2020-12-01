import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { TweetRow } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";
import { TWEET_SNOWFLAKE_REGEX } from "../utils";
import SkinModel from "./SkinModel";

export type TweetDebugData = {
  row: TweetRow;
};

export default class TweetModel {
  constructor(readonly ctx: UserContext, readonly row: TweetRow) {}

  static async fromMd5(ctx: UserContext, md5: string): Promise<TweetModel[]> {
    const rows = await getTweetsLoader(ctx).load(md5);
    return rows.map((row) => new TweetModel(ctx, row));
  }

  static async fromUrl(
    ctx: UserContext,
    url: string
  ): Promise<TweetModel | null> {
    const row = await getTweetByTweetUrlLoader(ctx).load(url);
    if (row == null) {
      return null;
    }
    return new TweetModel(ctx, row);
  }

  static async fromAnything(
    ctx: UserContext,
    anything: string
  ): Promise<TweetModel | null> {
    const snowflakeMatch = anything.match(TWEET_SNOWFLAKE_REGEX);
    if (snowflakeMatch == null) {
      return null;
    }
    const snowflake = snowflakeMatch[1];
    const found = await TweetModel.fromUrl(
      ctx,
      `https://twitter.com/winampskins/status/${snowflake}`
    );
    return found || null;
  }

  getMd5(): string {
    return this.row.skin_md5;
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

  async getSkin(): Promise<SkinModel> {
    const skin = await SkinModel.fromMd5(this.ctx, this.getMd5());
    if (skin == null) {
      throw new Error(`Could not find skin for md5 "${this.getMd5()}"`);
    }
    return skin;
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

const getTweetByTweetUrlLoader = ctxWeakMapMemoize<
  DataLoader<string, TweetRow>
>(
  () =>
    new DataLoader(async (urls) => {
      const rows = await knex("tweets").whereIn("url", urls).select();
      return urls.map((url) => rows.find((x) => x.url === url));
    })
);
