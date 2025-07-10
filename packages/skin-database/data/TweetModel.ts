import UserContext, { ctxWeakMapMemoize } from "./UserContext";
import { TweetRow } from "../types";
import DataLoader from "dataloader";
import { knex } from "../db";
import { TWEET_SNOWFLAKE_REGEX } from "../utils";
import SkinModel from "./SkinModel";
import { Int } from "grats";
import { ISkin } from "../api/graphql/resolvers/CommonSkinResolver";
import SkinResolver from "../api/graphql/resolvers/SkinResolver";

export type TweetDebugData = {
  row: TweetRow;
};

/**
 * A tweet made by @winampskins mentioning a Winamp skin
 * @gqlType Tweet
 */
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

  /**
   * URL of the tweet. **Note:** Early on in the bot's life we just recorded
   * _which_ skins were tweeted, not any info about the actual tweet. This means we
   * don't always know the URL of the tweet.
   * @gqlField url
   */
  getUrl(): string | null {
    const tweetId = this.getTweetId();
    return tweetId ? `https://twitter.com/winampskins/status/${tweetId}` : null;
  }
  /**
   * Number of likes the tweet has received. Updated nightly. (Note: Recent likes on older tweets may not be reflected here)
   * @gqlField likes
   */
  getLikes(): Int {
    return this.row.likes ?? 0;
  }

  /**
   * Number of retweets the tweet has received. Updated nightly. (Note: Recent retweets on older tweets may not be reflected here)
   * @gqlField retweets
   */
  getRetweets(): Int {
    return this.row.retweets ?? 0;
  }

  async getSkin(): Promise<SkinModel> {
    return SkinModel.fromMd5Assert(this.ctx, this.getMd5());
  }

  /**
   * The skin featured in this Tweet
   * @gqlField
   */
  async skin(): Promise<ISkin | null> {
    const skin = await this.getSkin();
    if (skin == null) {
      return null;
    }
    return SkinResolver.fromModel(skin);
  }

  async debug(): Promise<TweetDebugData> {
    return {
      row: this.row,
    };
  }
}

/**
 * Get a tweet by its URL
 * @gqlQueryField
 */
export async function fetch_tweet_by_url(
  url: string,
  ctx: UserContext
): Promise<TweetModel | null> {
  return TweetModel.fromAnything(ctx, url);
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
