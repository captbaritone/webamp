import { Int } from "grats";
import TweetModel from "../../data/TweetModel";
import { knex } from "../../db";
import TweetResolver from "./resolvers/TweetResolver";

/** @gqlEnum */
export type TweetsSortOption = "LIKES" | "RETWEETS";

/** @gqlType */
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
  async nodes(args: never, ctx): Promise<TweetResolver[]> {
    const tweets = await this._getQuery()
      .select()
      .limit(this._first)
      .offset(this._offset);
    return tweets.map((tweet) => {
      return new TweetResolver(new TweetModel(ctx, tweet));
    });
  }
}
