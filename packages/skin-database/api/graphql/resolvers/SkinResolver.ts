import { Int } from "grats";
import SkinModel from "../../../data/SkinModel";
import UserContext from "../../../data/UserContext";
import ClassicSkinResolver from "./ClassicSkinResolver";
import { ISkin } from "./CommonSkinResolver";
import ModernSkinResolver from "./ModernSkinResolver";
import * as Skins from "../../../data/skins";
import { knex } from "../../../db";

export default class SkinResolver {
  constructor() {
    throw new Error("This is a stub.");
  }
  static async fromMd5(ctx: UserContext, md5: string): Promise<ISkin | null> {
    const skin = await SkinModel.fromMd5(ctx, md5);
    if (skin == null) {
      return null;
    }
    return this.fromModel(skin);
  }
  static fromModel(model: SkinModel): ISkin {
    if (model.getSkinType() === "MODERN") {
      return new ModernSkinResolver(model);
    } else {
      return new ClassicSkinResolver(model);
    }
  }
}

/**
 * Get a skin by its MD5 hash
 * @gqlQueryField
 */
export async function fetch_skin_by_md5(
  md5: string,
  ctx: UserContext
): Promise<ISkin | null> {
  const skin = await SkinModel.fromMd5(ctx, md5);
  if (skin == null) {
    return null;
  }
  return SkinResolver.fromModel(skin);
}

/**
 * Search the database using the Algolia search index used by the Museum.
 *
 * Useful for locating a particular skin.
 * @gqlQueryField
 */
export async function search_skins(
  query: string,
  first: Int = 10,
  offset: Int = 0,
  ctx: UserContext
): Promise<Array<ISkin | null>> {
  if (first > 1000) {
    throw new Error("Can only query 1000 records via search.");
  }

  const skins = await knex("skin_search")
    .select("skin_md5")
    .leftJoin("skins", "skin_search.skin_md5", "skins.md5")
    .where("skins.skin_type", "in", [1, 2])
    .limit(first)
    .offset(offset)
    .whereRaw("skin_search MATCH ?", query);

  return Promise.all(
    skins.map(async (hit) => {
      const model = await SkinModel.fromMd5Assert(ctx, hit.skin_md5);
      return SkinResolver.fromModel(model);
    })
  );
}

/**
 * Search the database using SQLite's FTS (full text search) index.
 *
 * Useful for locating a particular skin.
 * @gqlQueryField
 */
export async function search_classic_skins(
  query: string,
  first: Int = 10,
  offset: Int = 0,
  ctx: UserContext
): Promise<Array<ClassicSkinResolver | null>> {
  if (first > 1000) {
    throw new Error("Can only query 1000 records via search.");
  }

  // const skins = await knex("skin_search")
  //   .select("skin_search.skin_md5")
  //   .leftJoin("skins", "skin_search.skin_md5", "skins.md5")
  //   .leftJoin("skin_reviews", "skins.md5", "skin_reviews.skin_md5")
  //   .where("skins.skin_type", "=", 1)
  //   .orderByRaw("CASE WHEN skin_reviews.review = 'NSFW' THEN 1 ELSE 0 END")
  //   .limit(first)
  //   .offset(offset)
  //   .whereRaw("skin_search MATCH ?", query);

  const skins = await knex("skin_search")
    .select("skin_md5")
    .leftJoin("skins", "skin_search.skin_md5", "skins.md5")
    .where("skins.skin_type", "=", 1)
    .limit(first)
    .offset(offset)
    .whereRaw("skin_search MATCH ?", query);

  return Promise.all(
    skins.map(async (hit) => {
      const model = await SkinModel.fromMd5Assert(ctx, hit.skin_md5);
      return new ClassicSkinResolver(model);
    })
  );
}
/**
 * A random skin that needs to be reviewed
 * @gqlQueryField */
export async function skin_to_review(ctx: UserContext): Promise<ISkin | null> {
  if (!ctx.authed()) {
    return null;
  }
  const { md5 } = await Skins.getSkinToReview();
  const model = await SkinModel.fromMd5Assert(ctx, md5);
  return SkinResolver.fromModel(model);
}
