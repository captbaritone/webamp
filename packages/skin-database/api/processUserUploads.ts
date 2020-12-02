import * as Skins from "../data/skins";
import S3 from "../s3";
import { addSkinFromBuffer } from "../addSkin";
import { EventHandler } from "./app";

let processing = false;

export async function processUserUploads(eventHandler: EventHandler) {
  // Ensure we only have one worker processing requests.
  if (processing) {
    return;
  }
  processing = true;
  let upload = await Skins.getReportedUpload();
  while (upload != null) {
    try {
      const buffer = await S3.getUploadedSkin(upload.id);
      const result = await addSkinFromBuffer(
        buffer,
        upload.filename,
        "Web API"
      );
      await Skins.recordUserUploadArchived(upload.id);
      if (result.status === "ADDED") {
        const action = {
          type:
            result.skinType === "CLASSIC"
              ? "CLASSIC_SKIN_UPLOADED"
              : "MODERN_SKIN_UPLOADED",
          md5: result.md5,
        } as const;
        eventHandler(action);
      }
    } catch (e) {
      await Skins.recordUserUploadErrored(upload.id);
      const action = {
        type: "SKIN_UPLOAD_ERROR",
        uploadId: upload.id,
        message: e.message,
      } as const;
      eventHandler(action);
      console.error(e);
    }
    upload = await Skins.getReportedUpload();
  }

  processing = false;
}
