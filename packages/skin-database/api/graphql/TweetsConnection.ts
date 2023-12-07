import { Int } from "grats";
import TweetModel from "../../data/TweetModel";
import { knex } from "../../db";
import TweetResolver from "./resolvers/TweetResolver";
import RootResolver from "./resolvers/RootResolver";
import { GqlCtx } from "./GqlCtx";

/** @gqlEnum */
export type TweetsSortOption = "LIKES" | "RETWEETS";

/**
 * A collection of tweets made by the @winampskins bot
 * @gqlType
 */
export default class TweetsConnection {
  _first: number;
  _offset: number;
  _sort?: TweetsSortOption;
  constructor(first: number, offset: number, sort?: TweetsSortOption) {
    this._first = first;
    this._offset = offset;
    this._sort = sort;
  }
  _getQuery() {
    let query = knex("tweets");

    if (this._sort === "LIKES") {
      query = query.orderBy("likes", "desc");
    } else if (this._sort === "RETWEETS") {
      query = query.orderBy("retweets", "desc");
    }

    return query;
  }

  /**
   * The total number of tweets
   * @gqlField
   */
  async count(): Promise<Int> {
    const count = await this._getQuery().count("*", { as: "count" });
    return Number(count[0].count);
  }

  /**
   * The list of tweets
   * @gqlField
   */
  async nodes(
    args: unknown,
    ctx: GqlCtx
  ): Promise<Array<TweetResolver | null>> {
    const tweets = await this._getQuery()
      .select()
      .limit(this._first)
      .offset(this._offset);
    return tweets.map((tweet) => {
      return new TweetResolver(new TweetModel(ctx, tweet));
    });
  }
}

/**
 * Tweets tweeted by @winampskins
 * @gqlField
 */
export async function tweets(
  _: RootResolver,
  {
    first = 10,
    offset = 0,
    sort,
  }: {
    first?: Int;
    offset?: Int;
    sort?: TweetsSortOption;
  }
): Promise<TweetsConnection> {
  if (first > 1000) {
    throw new Error("Maximum limit is 1000");
  }
  return new TweetsConnection(first, offset, sort);
}
