import TweetModel from "../../data/TweetModel";
import { knex } from "../../db";
import TweetResolver from "./resolvers/TweetResolver";

export default class TweetsConnection {
  _first: number;
  _offset: number;
  _sort: string;
  constructor(first: number, offset: number, sort: string) {
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

  async count() {
    const count = await this._getQuery().count("*", { as: "count" });
    return count[0].count;
  }

  async nodes(args, ctx) {
    const tweets = await this._getQuery()
      .select()
      .limit(this._first)
      .offset(this._offset);
    return tweets.map((tweet) => {
      return new TweetResolver(new TweetModel(ctx, tweet));
    });
  }
}
