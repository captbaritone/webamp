import SkinModel from "../../data/SkinModel";
import * as Skins from "../../data/skins";
import { knex } from "../../db";
import SkinResolver from "./resolvers/SkinResolver";
import LRU from "lru-cache";
import { Int } from "grats";
import { ISkin } from "./resolvers/CommonSkinResolver";
import RootResolver from "./resolvers/RootResolver";
import { GqlCtx } from "./GqlCtx";

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

/**
 * A collection of classic Winamp skins
 * @gqlType
 */
export default class SkinsConnection {
  _first: number;
  _offset: number;
  _sort?: string;
  _filter?: string;
  constructor(first: number, offset: number, sort?: string, filter?: string) {
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

  /**
   * The total number of skins matching the filter
   * @gqlField
   */
  async count(): Promise<Int> {
    if (this._sort === "MUSEUM") {
      // This is the common case, so serve it from cache.
      return getMuseumSkinCountFromCache();
    }
    const count = await this._getQuery().count("*", { as: "count" });
    return Number(count[0].count);
  }

  /**
   * The list of skins
   * @gqlField
   */
  async nodes(args: unknown, ctx: GqlCtx): Promise<Array<ISkin | null>> {
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

/**
 * All classic skins in the database
 *
 * **Note:** We don't currently support combining sorting and filtering.
 * @gqlField */
export function skins(
  _: RootResolver,
  {
    first = 10,
    offset = 0,
    sort,
    filter,
  }: {
    first?: Int;
    offset?: Int;
    sort?: SkinsSortOption;
    filter?: SkinsFilterOption;
  }
): SkinsConnection {
  if (first > 1000) {
    throw new Error("Maximum limit is 1000");
  }
  return new SkinsConnection(first, offset, sort, filter);
}

/** @gqlEnum */
type SkinsSortOption =
  /**
the Museum's (https://skins.webamp.org) special sorting rules.

Roughly speaking, it's:

1. The four classic default skins
2. Tweeted skins first (sorted by the number of likes/retweets)
3. Approved, but not tweeted yet, skins
4. Unreviwed skins
5. Rejected skins
6. NSFW skins
*/
  "MUSEUM";

/** @gqlEnum */
type SkinsFilterOption =
  /*
Only the skins that have been approved for tweeting
*/
  | "APPROVED"

  /*
Only the skins that have been rejected for tweeting
*/
  | "REJECTED"

  /*
Only the skins that have been marked NSFW
*/
  | "NSFW"

  /*
Only the skins that have been tweeted
*/
  | "TWEETED";
