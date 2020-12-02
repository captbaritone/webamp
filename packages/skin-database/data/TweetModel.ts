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

  static async fromTweetId(
    ctx: UserContext,
    tweetId: string
  ): Promise<TweetModel | null> {
    const row = await getTweetByTweetIdLoader(ctx).load(tweetId);
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
    const found = await TweetModel.fromTweetId(ctx, snowflake);
    return found || null;
  }

  getMd5(): string {
    return this.row.skin_md5;
  }

  getTweetId(): string | null {
    return this.row.tweet_id || null;
  }

  getUrl(): string | null {
    const tweetId = this.getTweetId();
    return tweetId ? `https://twitter.com/winampskins/status/${tweetId}` : null;
  }
  getLikes(): number {
    return this.row.likes ?? 0;
  }
  getRetweets(): number {
    return this.row.retweets ?? 0;
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

const getTweetByTweetIdLoader = ctxWeakMapMemoize<DataLoader<string, TweetRow>>(
  () =>
    new DataLoader(async (ids) => {
      const rows = await knex("tweets").whereIn("tweet_id", ids).select();
      return ids.map((id) => rows.find((x) => x.tweet_id === id));
    })
);
