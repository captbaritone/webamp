import * as Parallel from "async-parallel";
import SkinModel from "../../../data/SkinModel";
import * as S3 from "../../../s3";
import * as Skins from "../../../data/skins";
import { processUserUploads } from "../../processUserUploads";

// We don't use a resolver here, just return the value directly.
type UploadUrl = { id: string; url: string; md5: string };

class UploadMutationResolver {
  async get_upload_urls(
    { files }: { files: { filename: string; md5: string }[] },
    { ctx }
  ): Promise<UploadUrl[]> {
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

  async report_skin_uploaded({ id, md5 }, req) {
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

export default class MutationResolver {
  async upload() {
    return new UploadMutationResolver();
  }
  async send_feedback({ message, email, url }, req) {
    req.notify({
      type: "GOT_FEEDBACK",
      url,
      message,
      email,
    });
    return true;
  }

  reject_skin = requireAuthed(async ({ md5 }, req) => {
    req.log(`Rejecting skin with hash "${md5}"`);
    const skin = await SkinModel.fromMd5Assert(req.ctx, md5);
    if (skin == null) {
      return false;
    }
    await Skins.reject(req.ctx, md5);
    req.notify({ type: "REJECTED_SKIN", md5 });
    return true;
  });

  approve_skin = requireAuthed(async ({ md5 }, req) => {
    req.log(`Approving skin with hash "${md5}"`);
    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      return false;
    }
    await Skins.approve(req.ctx, md5);
    req.notify({ type: "APPROVED_SKIN", md5 });
    return true;
  });

  mark_skin_nsfw = requireAuthed(async ({ md5 }, req) => {
    req.log(`Approving skin with hash "${md5}"`);
    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      return false;
    }
    await Skins.markAsNSFW(req.ctx, md5);
    req.notify({ type: "MARKED_SKIN_NSFW", md5 });
    return true;
  });

  async request_nsfw_review_for_skin({ md5 }, req) {
    req.log(`Reporting skin with hash "${md5}"`);
    // Blow up if there is no skin with this hash
    await SkinModel.fromMd5Assert(req.ctx, md5);
    req.notify({ type: "REVIEW_REQUESTED", md5 });
    return true;
  }
}
