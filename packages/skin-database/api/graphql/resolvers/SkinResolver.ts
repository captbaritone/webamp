import * as Skins from "../../../data/skins";
import SkinModel from "../../../data/SkinModel";
import UserContext from "../../../data/UserContext";
import ClassicSkinResolver from "./ClassicSkinResolver";
import { ISkin } from "./CommonSkinResolver";
import ModernSkinResolver from "./ModernSkinResolver";
import RootResolver from "./RootResolver";
import { Int } from "grats";

import algoliasearch from "algoliasearch";
import { requireAuthed, MutationResolver } from "./MutationResolver";
import { GqlCtx } from "../GqlCtx";

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
 * Search the database using the Algolia search index used by the Museum.
 *
 * Useful for locating a particular skin.
 * @gqlField
 */
export async function search_skins(
  _: RootResolver,
  {
    query,
    first = 10,
    offset = 0,
  }: { query: string; first?: Int; offset?: Int },
  { ctx }: GqlCtx
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
  _: RootResolver,
  _args: unknown,
  { ctx }: GqlCtx
): Promise<ISkin | null> {
  if (!ctx.authed()) {
    return null;
  }
  const { md5 } = await Skins.getSkinToReview();
  const model = await SkinModel.fromMd5Assert(ctx, md5);
  return SkinResolver.fromModel(model);
}

/**
 * Request that an admin check if this skin is NSFW.
 * Unlike other review mutation endpoints, this one does not require being logged
 * in.
 * @gqlField */
export async function request_nsfw_review_for_skin(
  _: MutationResolver,
  { md5 }: { md5: string },
  req: GqlCtx
): Promise<boolean> {
  req.log(`Reporting skin with hash "${md5}"`);
  // Blow up if there is no skin with this hash
  await SkinModel.fromMd5Assert(req.ctx, md5);
  req.notify({ type: "REVIEW_REQUESTED", md5 });
  return true;
}

/**
 * Mark a skin as NSFW
 *
 * **Note:** Requires being logged in
 * @gqlField */
export function mark_skin_nsfw(
  _: MutationResolver,
  args: { md5: string },
  req: GqlCtx
): Promise<boolean> {
  return _mark_skin_nsfw(args, req);
}

const _mark_skin_nsfw = requireAuthed(async ({ md5 }, req) => {
  req.log(`Approving skin with hash "${md5}"`);
  const skin = await SkinModel.fromMd5(req.ctx, md5);
  if (skin == null) {
    return false;
  }
  await Skins.markAsNSFW(req.ctx, md5);
  req.notify({ type: "MARKED_SKIN_NSFW", md5 });
  return true;
});

/**
 * Reject skin for tweeting
 *
 * **Note:** Requires being logged in
 * @gqlField */
export function reject_skin(
  _: MutationResolver,
  args: { md5: string },
  req: GqlCtx
): Promise<boolean> {
  return _reject_skin(args, req);
}

const _reject_skin = requireAuthed(async ({ md5 }, req) => {
  req.log(`Rejecting skin with hash "${md5}"`);
  const skin = await SkinModel.fromMd5Assert(req.ctx, md5);
  if (skin == null) {
    return false;
  }
  await Skins.reject(req.ctx, md5);
  req.notify({ type: "REJECTED_SKIN", md5 });
  return true;
});

/**
 * Approve skin for tweeting
 *
 * **Note:** Requires being logged in
 * @gqlField */
export function approve_skin(
  _: MutationResolver,
  args: { md5: string },
  req: GqlCtx
): Promise<boolean> {
  return _approve_skin(args, req);
}

const _approve_skin = requireAuthed(async ({ md5 }, req) => {
  req.log(`Approving skin with hash "${md5}"`);
  const skin = await SkinModel.fromMd5(req.ctx, md5);
  if (skin == null) {
    return false;
  }
  await Skins.approve(req.ctx, md5);
  req.notify({ type: "APPROVED_SKIN", md5 });
  return true;
});
