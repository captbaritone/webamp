import * as Parallel from "async-parallel";
import SkinModel from "../../../data/SkinModel";
import * as S3 from "../../../s3";
import * as Skins from "../../../data/skins";
import { processUserUploads } from "../../processUserUploads";

// We don't use a resolver here, just return the value directly.
/**
 * A URL that the client can use to upload a skin to S3, and then notify the server
 * when they're done.
 * @gqlType
 */
type UploadUrl = {
  /** @gqlField */
  id: string;
  /** @gqlField */
  url: string;
  /** @gqlField */
  md5: string;
};

/**
 * Input object used for a user to request an UploadUrl
 * @gqlInput
 */
type UploadUrlRequest = { filename: string; md5: string };

/**
 * Mutations for the upload flow
 *
 * 1. The user finds the md5 hash of their local files.
 * 2. (`get_upload_urls`) The user requests upload URLs for each of their files.
 * 3. The server returns upload URLs for each of their files which are not already in the collection.
 * 4. The user uploads each of their files to the URLs returned in step 3.
 * 5. (`report_skin_uploaded`) The user notifies the server that they're done uploading.
 * 6. (TODO) The user polls for the status of their uploads.
 *
 * @gqlType UploadMutations */
class UploadMutationResolver {
  /**
   * Get a (possibly incompelte) list of UploadUrls for each of the files. If an
   * UploadUrl is not returned for a given hash, it means the file is already in
   * the collection.
   * @gqlField
   */
  async get_upload_urls(
    { files }: { files: UploadUrlRequest[] },
    { ctx }
  ): Promise<Array<UploadUrl | null>> {
    const missing: UploadUrl[] = [];
    await Parallel.each(
      files,
      async ({ md5, filename }) => {
        if (!(await SkinModel.exists(ctx, md5))) {
          const id = await Skins.recordUserUploadRequest(md5, filename);
          const url = S3.getSkinUploadUrl(md5, id);
          missing.push({ id, url, md5 });
        }
      },
      5
    );

    return missing;
  }

  /**
   * Notify the server that the user is done uploading.
   * @gqlField
   */
  async report_skin_uploaded(
    { id, md5 }: { id: string; md5: string },
    req
  ): Promise<boolean> {
    // TODO: Validate md5 and id;
    await Skins.recordUserUploadComplete(md5, id);
    // Don't await, just kick off the task.
    processUserUploads(req.notify);
    return true;
  }
}

function requireAuthed(handler) {
  return (args, req) => {
    if (!req.ctx.authed()) {
      throw new Error("You must be logged in to read this field.");
    } else {
      return handler(args, req);
    }
  };
}

/**
 *
 * @gqlType Mutation */
export default class MutationResolver {
  /**
   * Mutations for the upload flow
   * @gqlField */
  async upload(): Promise<UploadMutationResolver> {
    return new UploadMutationResolver();
  }
  /**
   * Send a message to the admin of the site. Currently this appears in Discord.
   * @gqlField */
  async send_feedback(
    { message, email, url }: { message: string; email?: string; url?: string },
    req
  ): Promise<boolean> {
    req.notify({
      type: "GOT_FEEDBACK",
      url,
      message,
      email,
    });
    return true;
  }

  /**
   * Reject skin for tweeting
   *
   * **Note:** Requires being logged in
   * @gqlField */
  reject_skin(args: { md5: string }, req): Promise<boolean> {
    return this._reject_skin(args, req);
  }

  _reject_skin = requireAuthed(async ({ md5 }, req) => {
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
  approve_skin(args: { md5: string }, req): Promise<boolean> {
    return this._approve_skin(args, req);
  }

  _approve_skin = requireAuthed(async ({ md5 }, req) => {
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
  mark_skin_nsfw(args: { md5: string }, req): Promise<boolean> {
    return this._mark_skin_nsfw(args, req);
  }

  _mark_skin_nsfw = requireAuthed(async ({ md5 }, req) => {
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
   * Unlike other review mutaiton endpoints, this one does not require being logged
   * in.
   * @gqlField */
  async request_nsfw_review_for_skin(
    { md5 }: { md5: string },
    req
  ): Promise<boolean> {
    req.log(`Reporting skin with hash "${md5}"`);
    // Blow up if there is no skin with this hash
    await SkinModel.fromMd5Assert(req.ctx, md5);
    req.notify({ type: "REVIEW_REQUESTED", md5 });
    return true;
  }
}
