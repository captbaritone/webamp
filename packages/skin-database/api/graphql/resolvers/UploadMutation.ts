import * as Parallel from "async-parallel";
import SkinModel from "../../../data/SkinModel";
import * as S3 from "../../../s3";
import * as Skins from "../../../data/skins";
import { processUserUploads } from "../../processUserUploads";
import { Ctx } from "..";

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
   * Get a (possibly incomplete) list of UploadUrls for each of the files. If an
   * UploadUrl is not returned for a given hash, it means the file is already in
   * the collection.
   * @gqlField
   */
  async get_upload_urls(
    { files }: { files: UploadUrlRequest[] },
    { ctx }: Ctx
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
    req: Ctx
  ): Promise<boolean> {
    // TODO: Validate md5 and id;
    await Skins.recordUserUploadComplete(md5, id);
    // Don't await, just kick off the task.
    processUserUploads(req.notify);
    return true;
  }
}

/**
 * Mutations for the upload flow
 * @gqlMutationField */
export async function upload(): Promise<UploadMutationResolver> {
  return new UploadMutationResolver();
}
