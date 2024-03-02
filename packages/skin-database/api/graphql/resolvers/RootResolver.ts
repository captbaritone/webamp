import SkinModel from "../../../data/SkinModel";
import SkinResolver from "../resolvers/SkinResolver";
import SkinsConnection from "../SkinsConnection";
import { Int } from "grats";

import { knex } from "../../../db";
import ModernSkinsConnection from "../ModernSkinsConnection";
import { ISkin } from "./CommonSkinResolver";
import { Ctx } from "..";

/** @gqlType Query */
export type Query = unknown;

/**
 * All classic skins in the database
 *
 * **Note:** We don't currently support combining sorting and filtering.
 * @gqlField */
export function skins(
  _: Query,
  {
    first = 10,
    offset = 0,
    sort,
    filter,
  }: {
    first?: Int;
    offset?: Int;
    sort?: SkinsSortOption | null;
    filter?: SkinsFilterOption | null;
  }
): SkinsConnection {
  if (first > 1000) {
    throw new Error("Maximum limit is 1000");
  }
  return new SkinsConnection(first, offset, sort, filter);
}

/**
 * All modern skins in the database
 * @gqlField */
export async function modern_skins(
  _: Query,
  {
    first = 10,
    offset = 0,
  }: {
    first?: Int;
    offset?: Int;
  }
): Promise<ModernSkinsConnection> {
  if (first > 1000) {
    throw new Error("Maximum limit is 1000");
  }
  return new ModernSkinsConnection(first, offset);
}

/**
 * Get the status of a batch of uploads by md5s
 * @gqlField
 * @deprecated Prefer `upload_statuses` instead, were we operate on ids.
 */
export async function upload_statuses_by_md5(
  _: Query,
  { md5s }: { md5s: string[] },
  { ctx }: Ctx
): Promise<Array<SkinUpload | null>> {
  return _upload_statuses({ keyName: "skin_md5", keys: md5s }, ctx);
}

/**
 * Get the status of a batch of uploads by ids
 * @gqlField */
export async function upload_statuses(
  _: Query,
  { ids }: { ids: string[] },
  { ctx }: Ctx
): Promise<Array<SkinUpload | null>> {
  return _upload_statuses({ keyName: "id", keys: ids }, ctx);
}

// Shared implementation for upload_statuses and upload_statuses_by_md5
async function _upload_statuses({ keyName, keys }, ctx) {
  const skins = await knex("skin_uploads")
    .whereIn(keyName, keys)
    .orderBy("id", "desc")
    .select("id", "skin_md5", "status");

  return Promise.all(
    skins.map(async ({ id, skin_md5, status }) => {
      // TODO: Could we avoid fetching the skin if it's not read?
      const skinModel = await SkinModel.fromMd5(ctx, skin_md5);
      const skin = skinModel == null ? null : SkinResolver.fromModel(skinModel);
      // Most of the time when a skin fails to process, it's due to some infa
      // issue on our side, and we can recover. For now, we'll always tell the user
      // That processing is just delayed.
      status = status === "ERRORED" ? "DELAYED" : status;
      return { id, skin, status, upload_md5: skin_md5 };
    })
  );
}

/**
 * Information about an attempt to upload a skin to the Museum.
 * @gqlType
 */
type SkinUpload = {
  /** @gqlField */
  id: string;
  /** @gqlField */
  status: SkinUploadStatus;
  /**
   * Skin that was uploaded. **Note:** This is null if the skin has not yet been
   * fully processed. (status == ARCHIVED)
   * @gqlField
   */
  skin: ISkin | null;
  /**
   * Md5 hash given when requesting the upload URL.
   * @gqlField
   */
  upload_md5: string;
};

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

/**
 * The current status of a pending upload.
 *
 * **Note:** Expect more values here as we try to be more transparent about
 * the status of a pending uploads.
 * @gqlEnum
 */
type SkinUploadStatus =
  /** The user has requested a URL, but the skin has not yet been processed. */
  | "URL_REQUESTED"
  /** The user has notified us that the skin has been uploaded, but we haven't yet
  processed it. */
  | "UPLOAD_REPORTED"
  /** An error occured processing the skin. Usually this is a transient error, and
  the skin will be retried at a later time. */
  | "ERRORED"
  /** An error occured processing the skin, but it was the fault of the server. It
  will be processed at a later date. */
  | "DELAYED"
  /** The skin has been successfully added to the Museum.
   * @deprecated
   */
  | "ARCHIVED";
