const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });
const { MD5_REGEX } = require("./utils");

const s3 = new AWS.S3({
  // https://stackoverflow.com/a/40772298/1263117
  region: "us-east-1",
});

function putSkin(md5, buffer, ext = "wsz") {
  return new Promise((resolve, rejectPromise) => {
    const bucketName = "cdn.webampskins.org";
    const key = `skins/${md5}.${ext}`;
    s3.putObject(
      {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ACL: "public-read",
      },
      (err) => {
        if (err) {
          rejectPromise(err);
          return;
        }
        resolve();
      }
    );
  });
}

function getSkinUploadUrl(md5, id) {
  if (!MD5_REGEX.test(md5)) {
    throw new Error(`Invalid md5: "${md5}"`);
  }
  const bucketName = "cdn.webampskins.org";
  const key = `user_uploads/${id}`;
  return s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: key,
    // ContentMD5: md5,
    // The number of seconds to expire the pre-signed URL operation in.
    Expires: 60 * 60, // One hour
    ContentType: "binary/octet-stream",
  });
}

function getUploadedSkin(id) {
  const bucketName = "cdn.webampskins.org";
  const key = `user_uploads/${id}`;
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: bucketName,
        Key: key,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Body);
        }
      }
    );
  });
}

function deleteSkin(md5, ext = "wsz") {
  return new Promise((resolve, rejectPromise) => {
    const bucketName = "cdn.webampskins.org";
    const key = `skins/${md5}.${ext}`;
    s3.deleteObject(
      {
        Bucket: bucketName,
        Key: key,
      },
      (err) => {
        if (err) {
          rejectPromise(err);
          return;
        }
        resolve();
      }
    );
  });
}

function deleteScreenshot(md5) {
  return new Promise((resolve, rejectPromise) => {
    const bucketName = "cdn.webampskins.org";
    const key = `screenshots/${md5}.png`;
    s3.deleteObject(
      {
        Bucket: bucketName,
        Key: key,
      },
      (err) => {
        if (err) {
          rejectPromise(err);
          return;
        }
        resolve();
      }
    );
  });
}

function putScreenshot(md5, buffer) {
  return new Promise((resolve, rejectPromise) => {
    const bucketName = "cdn.webampskins.org";
    const key = `screenshots/${md5}.png`;
    s3.putObject(
      {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ACL: "public-read",
      },
      (err) => {
        if (err) {
          rejectPromise(err);
          return;
        }
        resolve();
      }
    );
  });
}

module.exports = {
  putScreenshot,
  putSkin,
  deleteSkin,
  getUploadedSkin,
  deleteScreenshot,
  getSkinUploadUrl,
};
