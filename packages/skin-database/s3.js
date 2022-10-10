const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });
const { MD5_REGEX } = require("./utils");

// https://developers.cloudflare.com/r2/examples/aws-sdk-js/
const s3 = new AWS.S3({
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: "auto",
});

const bucketName = "winamp-skins";
// Needed for S3 but not R2
// const acl = { ACL: "public-read" };
const acl = {};

async function configureCors() {
  console.log("Going to configure cors");
  const current = await s3.getBucketCors({ Bucket: bucketName }).promise();
  console.log("Current cors", JSON.stringify(current, null, 2));
  await s3
    .putBucketCors({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ["*"],
            // It looks like R2 treats these as case sensitive, which I suspect is a bug.
            AllowedHeaders: ["content-type", "Content-Type"],
            AllowedMethods: ["PUT", "GET"],
          },
        ],
      },
    })
    .promise();
  const newCors = await s3.getBucketCors({ Bucket: bucketName }).promise();
  console.log("New cors", JSON.stringify(newCors, null, 2));
  console.log("Done");
}

/*
const s3 = new AWS.S3({
  // https://stackoverflow.com/a/40772298/1263117
  region: "us-east-1",
});
*/

function putSkin(md5, buffer, ext = "wsz") {
  return new Promise((resolve, rejectPromise) => {
    const key = `skins/${md5}.${ext}`;
    s3.putObject(
      {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ...acl,
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
    const key = `screenshots/${md5}.png`;
    s3.putObject(
      {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ...acl,
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

function putTemp(fileName, buffer) {
  return new Promise((resolve, rejectPromise) => {
    const key = `temp/${fileName}`;
    s3.putObject(
      {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ...acl,
      },
      (err) => {
        console.log("Hello...");
        if (err) {
          rejectPromise(err);
          return;
        }
        resolve();
      }
    );
  });
}

function deleteTemp(fileName) {
  return new Promise((resolve, rejectPromise) => {
    const key = `screenshots/${fileName}`;
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

module.exports = {
  putTemp,
  deleteTemp,
  putScreenshot,
  putSkin,
  deleteSkin,
  getUploadedSkin,
  deleteScreenshot,
  getSkinUploadUrl,
  configureCors,
};
