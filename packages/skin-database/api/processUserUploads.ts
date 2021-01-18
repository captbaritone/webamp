import * as Skins from "../data/skins";
import S3 from "../s3";
import { addSkinFromBuffer } from "../addSkin";
import { EventHandler } from "./app";

async function* reportedUploads() {
  const seen = new Set();
  while (true) {
    const upload = await Skins.getReportedUpload();
    console.log("Found one", { upload });
    if (upload == null) {
      return;
    }
    if (seen.has(upload.id)) {
      await Skins.recordUserUploadErrored(upload.id);
      console.error("Saw the same upload twice. It didn't get handled?");
      return;
    }
    seen.add(upload.id);
    yield upload;
  }
}

let processing = false;

function log(...args: any[]) {
  console.log(...args);
}

const ONE_MINUTE_IN_MS = 1000 * 60;

function timeout<T>(p: Promise<T>, duration: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((resolve, reject) =>
      setTimeout(() => reject("timeout"), duration)
    ),
  ]);
}

export async function processUserUploads(eventHandler: EventHandler) {
  log("process user uploads");
  // Ensure we only have one worker processing requests.
  if (processing) {
    return;
  }
  processing = true;
  const uploads = reportedUploads();
  log("Uploads to process...");
  for await (const upload of uploads) {
    log("Going to try: ", upload);
    try {
      const buffer = await S3.getUploadedSkin(upload.id);
      log("Got buffer: ", upload);
      const result = await timeout(
        addSkinFromBuffer(buffer, upload.filename, "Web API"),
        ONE_MINUTE_IN_MS
      );
      log("Added skin from buffer: ", upload, result);
      await Skins.recordUserUploadArchived(upload.id);
      log("Recorded upload archived: ", upload);
      if (result.status === "ADDED") {
        const action = {
          type:
            result.skinType === "CLASSIC"
              ? "CLASSIC_SKIN_UPLOADED"
              : "MODERN_SKIN_UPLOADED",
          md5: result.md5,
        } as const;
        log("Skin was added, sending action:", action);
        eventHandler(action);
        log("Action sent:", action);
      }
    } catch (e) {
      log("Upload errored, going to report it:", upload);
      await Skins.recordUserUploadErrored(upload.id);
      log("Recorded upload errored:", upload);
      const action = {
        type: "SKIN_UPLOAD_ERROR",
        uploadId: upload.id,
        message: e.message,
      } as const;
      eventHandler(action);
      console.error(e);
    }
  }
  log("Done processing uploads.");

  processing = false;
}
