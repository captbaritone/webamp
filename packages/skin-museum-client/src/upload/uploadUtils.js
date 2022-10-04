import { gql, fetchGraphql } from "../utils";

// Upload a skin to S3 and then notify our API that it's ready to process.
export async function upload(fileObj) {
  const { md5, uploadUrl, uploadId, file } = fileObj;

  let retries = 10;

  while (true) {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "binary/octet-stream",
        //   "Content-MD5": md5
      },
      body: file,
    });

    if (response.status === 503 && retries > 0) {
      retries--;
      console.warn(
        `Request to ${uploadUrl} returned 503, going to retry again in 5 seconds. ${retries} retries left...`
      );
      await new Promise((resolve) => setTimeout((resolve) => 5000));
      continue;
    }

    if (!response.ok) {
      throw new Error("Failed to put skin to S3");
    }
    break;
  }

  await reportUploaded(md5, uploadId);
}

// Given a list of skin md5s, get back data about which skins are found/missing
// in the DB. For missing skins, we get a URL we can use to upload directly to
// S3.
export async function getUploadUrls(skins) {
  const files = Object.entries(skins).map(([md5, filename]) => {
    return {
      md5,
      filename,
    };
  });
  const mutation = gql`
    mutation GetUploadUrls($files: [UploadUrlRequest!]!) {
      upload {
        get_upload_urls(files: $files) {
          id
          url
          md5
        }
      }
    }
  `;
  const data = await fetchGraphql(mutation, { files });
  const normalized = {};
  for (const { id, url, md5 } of data.upload.get_upload_urls) {
    normalized[md5] = {
      id,
      url,
    };
  }
  return normalized;
}

// Tell the server that we've uploaded a given skin to S3.
export async function reportUploaded(md5, id) {
  const mutation = gql`
    mutation ReportUploaded($id: String!, $md5: String!) {
      upload {
        report_skin_uploaded(id: $id, md5: $md5)
      }
    }
  `;
  const data = await fetchGraphql(mutation, { id, md5 });
  if (!data.upload.report_skin_uploaded) {
    throw new Error("Unable to report skin as uploaded.");
  }
}

// Given a list of md5s, ask the server which ones have been fully screenshot etc.
export async function checkMd5sUploadStatus(md5s) {
  const query = gql`
    query CheckUploadStatus($md5s: [String!]!) {
      upload_statuses_by_md5(md5s: $md5s) {
        upload_md5
        status
      }
    }
  `;
  const data = await fetchGraphql(query, { md5s });
  const statusObj = {};
  data.upload_statuses_by_md5.forEach((status) => {
    statusObj[status.upload_md5] = status.status;
  });
  return statusObj;
}

export async function hashFile(file) {
  const { hashFile: hasher } = await import("../hashFile");
  return hasher(file);
}

/* SKIN UPLOAD UTILS */
const validSkinFilename = /(\.wsz)|(\.zip)|(.wal)$/i;

export function isValidSkinFilename(filename) {
  return validSkinFilename.test(filename);
}

export async function getSkinType(file) {
  const JSZip = (await import("jszip")).default;
  try {
    const zip = await JSZip.loadAsync(file);
    if (zip.file(/main\.bmp$/i).length > 0) {
      return "CLASSIC";
    } else if (zip.file(/skin\.xml$/i).length > 0) {
      return "MODERN";
    }
    return null;
  } catch (e) {
    // TODO: We could give a better message here.
    console.error(e);
    return null;
  }
}
