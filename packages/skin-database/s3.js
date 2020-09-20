const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });

const s3 = new AWS.S3();

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
        console.log(`Upladed skin to ${bucketName} ${key}`);
        resolve();
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
        console.log(`Upladed screenshot to ${bucketName} ${key}`);
        resolve();
      }
    );
  });
}

module.exports = {
  putScreenshot,
  putSkin,
  deleteSkin,
  deleteScreenshot,
};
