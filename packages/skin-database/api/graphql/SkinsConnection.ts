import SkinModel from "../../data/SkinModel";
import * as Skins from "../../data/skins";
import { knex } from "../../db";
import SkinResolver from "./resolvers/SkinResolver";

export default class SkinsConnection {
  _first: number;
  _offset: number;
  _sort: string;
  _filter: string;
  constructor(first: number, offset: number, sort: string, filter: string) {
    this._first = first;
    this._offset = offset;
    this._filter = filter;
    this._sort = sort;
  }
  _getQuery() {
    let query = knex("skins").where({ skin_type: 1 });

    // TODO: What happens if there are multiple tweets/reviews?
    // Do we return multiple instances of that skin?
    switch (this._filter) {
      case "APPROVED":
        query = query
          .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
          .where("review", "APPROVED");
        break;
      case "REJECTED":
        query = query
          .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
          .where("review", "REJECTED");
        break;
      case "NSFW":
        query = query
          .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
          .where("review", "NSFW");
        break;
      case "TWEETED":
        query = query.leftJoin("tweets", "tweet.skin_md5", "=", "skins.md5");
    }

    return query;
  }

  async count() {
    const count = await this._getQuery().count("*", { as: "count" });
    return count[0].count;
  }

  async nodes(args, ctx) {
    if (this._sort === "MUSEUM") {
      if (this._filter) {
        throw new Error(
          "We don't support combining sorting and filtering at the same time."
        );
      }
      const items = await Skins.getMuseumPage({
        first: this._first,
        offset: this._offset,
      });
      return Promise.all(
        items.map(async (item) => {
          const model = await SkinModel.fromMd5Assert(ctx, item.md5);
          return new SkinResolver(model);
        })
      );
    }

    const skins = await this._getQuery()
      .select()
      .limit(this._first)
      .offset(this._offset);
    return skins.map((skin) => {
      return new SkinResolver(new SkinModel(ctx, skin));
    });
  }
}
