import { Int } from "grats";
import { Ctx } from "..";
import SkinModel from "../../../data/SkinModel";
import UserContext from "../../../data/UserContext";
import ClassicSkinResolver from "./ClassicSkinResolver";
import { ISkin } from "./CommonSkinResolver";
import ModernSkinResolver from "./ModernSkinResolver";
import { Query } from "./QueryResolver";
import algoliasearch from "algoliasearch";
import * as Skins from "../../../data/skins";

// These keys are already in the web client, so they are not secret at all.
const client = algoliasearch("HQ9I5Z6IM5", "6466695ec3f624a5fccf46ec49680e51");
const index = client.initIndex("Skins");

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
 * @gqlField
 */
export async function fetch_skin_by_md5(
  _: Query,
  { md5 }: { md5: string },
  { ctx }: Ctx
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
 * @gqlField
 */
export async function search_skins(
  _: Query,
  {
    query,
    first = 10,
    offset = 0,
  }: { query: string; first?: Int; offset?: Int },
  { ctx }: Ctx
): Promise<Array<ISkin | null>> {
  if (first > 1000) {
    throw new Error("Can only query 1000 records via search.");
  }

  const results: { hits: { md5: string }[] } = await index.search(query, {
    attributesToRetrieve: ["md5"],
    length: first,
    offset,
  });

  return Promise.all(
    results.hits.map(async (hit) => {
      const model = await SkinModel.fromMd5Assert(ctx, hit.md5);
      return SkinResolver.fromModel(model);
    })
  );
}
/**
 * A random skin that needs to be reviewed
 * @gqlField */
export async function skin_to_review(
  _: Query,
  { ctx }: Ctx
): Promise<ISkin | null> {
  if (!ctx.authed()) {
    return null;
  }
  const { md5 } = await Skins.getSkinToReview();
  const model = await SkinModel.fromMd5Assert(ctx, md5);
  return SkinResolver.fromModel(model);
}
