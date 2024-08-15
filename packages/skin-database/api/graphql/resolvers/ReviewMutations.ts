import SkinModel from "../../../data/SkinModel";
import * as Skins from "../../../data/skins";
import { Ctx } from "..";
import { Mutation } from "./MutationResolver";

function requireAuthed(handler) {
  return (args, req: Ctx) => {
    if (!req.ctx.authed()) {
      throw new Error("You must be logged in to read this field.");
    } else {
      return handler(args, req);
    }
  };
}

/**
 * Reject skin for tweeting
 *
 * **Note:** Requires being logged in
 * @gqlField */
export function reject_skin(
  _: Mutation,
  args: { md5: string },
  req: Ctx
): Promise<boolean> {
  return _reject_skin(args, req);
}

const _reject_skin = requireAuthed(async ({ md5 }, req: Ctx) => {
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
  _: Mutation,
  args: { md5: string },
  req: Ctx
): Promise<boolean> {
  return _approve_skin(args, req);
}

const _approve_skin = requireAuthed(async ({ md5 }, req: Ctx) => {
  req.log(`Approving skin with hash "${md5}"`);
  const skin = await SkinModel.fromMd5(req.ctx, md5);
  if (skin == null) {
    return false;
  }
  await Skins.approve(req.ctx, md5);
  req.notify({ type: "APPROVED_SKIN", md5 });
  return true;
});

/**
 * Mark a skin as NSFW
 *
 * **Note:** Requires being logged in
 * @gqlField */
export function mark_skin_nsfw(
  _: Mutation,
  args: { md5: string },
  req: Ctx
): Promise<boolean> {
  return _mark_skin_nsfw(args, req);
}

const _mark_skin_nsfw = requireAuthed(async ({ md5 }, req: Ctx) => {
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
 * Request that an admin check if this skin is NSFW.
 * Unlike other review mutation endpoints, this one does not require being logged
 * in.
 * @gqlField */
export async function request_nsfw_review_for_skin(
  _: Mutation,
  { md5 }: { md5: string },
  req: Ctx
): Promise<boolean> {
  req.log(`Reporting skin with hash "${md5}"`);
  // Blow up if there is no skin with this hash
  await SkinModel.fromMd5Assert(req.ctx, md5);
  req.notify({ type: "REVIEW_REQUESTED", md5 });
  return true;
}
