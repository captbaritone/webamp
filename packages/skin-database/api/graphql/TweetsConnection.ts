import { Int } from "grats";
import TweetModel from "../../data/TweetModel";
import { knex } from "../../db";

/** @gqlEnum */
export type TweetsSortOption = "LIKES" | "RETWEETS";

/**
 * A collection of tweets made by the @winampskins bot
 * @gqlType
 */
export default class TweetsConnection {
  _first: number;
  _offset: number;
  _sort?: TweetsSortOption | null;
  constructor(first: number, offset: number, sort?: TweetsSortOption | null) {
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
  async nodes(): Promise<Array<TweetModel | null>> {
    return this._getQuery().select().limit(this._first).offset(this._offset);
  }
}

/**
 * Tweets tweeted by @winampskins
 * @gqlQueryField
 */
export async function tweets({
  first = 10,
  offset = 0,
  sort,
}: {
  first?: Int;
  offset?: Int;
  sort?: TweetsSortOption | null;
}): Promise<TweetsConnection> {
  if (first > 1000) {
    throw new Error("Maximum limit is 1000");
  }
  return new TweetsConnection(first, offset, sort);
}
