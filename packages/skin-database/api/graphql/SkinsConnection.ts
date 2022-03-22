import SkinModel from "../../data/SkinModel";
import * as Skins from "../../data/skins";
import { knex } from "../../db";
import SkinResolver from "./resolvers/SkinResolver";
import LRU from "lru-cache";

const options = {
  max: 100,
  maxAge: 1000 * 60 * 60,
};
let skinCount: number | null = null;
const cache = new LRU<string, Skins.MuseumPage>(options);

// A supery hacky global cache for common requests.
async function getMuseumSkinCountFromCache() {
  if (skinCount == null) {
    skinCount = await Skins.getClassicSkinCount();
  }
  return skinCount;
}

// A supery hacky global cache for common requests.
async function getSkinMuseumPageFromCache(first: number, offset: number) {
  const key = `${first}-${offset}`;
  const cached = cache.get(key);
  if (cached != null) {
    return cached;
  }
  const skins = await Skins.getMuseumPage({
    offset: Number(offset),
    first: Number(first),
  });
  cache.set(key, skins);
  return skins;
}

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
    if (this._sort === "MUSEUM") {
      // This is the common case, so serve it from cache.
      return getMuseumSkinCountFromCache();
    }
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
      const items = await getSkinMuseumPageFromCache(this._first, this._offset);
      return Promise.all(
        items.map(async (item) => {
          const model = await SkinModel.fromMd5Assert(ctx, item.md5);
          return SkinResolver.fromModel(model);
        })
      );
    }

    const skins = await this._getQuery()
      .select()
      .limit(this._first)
      .offset(this._offset);
    return skins.map((skin) => {
      return SkinResolver.fromModel(new SkinModel(ctx, skin));
    });
  }
}
