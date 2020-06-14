const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });

const s3 = new AWS.S3();

function putSkin(md5, buffer) {
  return new Promise((resolve, rejectPromise) => {
    const bucketName = "webamp-uploaded-skins";
    const key = `skins/${md5}.wsz`;
    s3.putObject(
      { Bucket: bucketName, Key: key, Body: buffer, ACL: "public-read" },
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

function putScreenshot(md5, buffer) {
  return new Promise((resolve, rejectPromise) => {
    const bucketName = "webamp-uploaded-skins";
    const key = `screenshots/${md5}.png`;
    s3.putObject(
      { Bucket: bucketName, Key: key, Body: buffer, ACL: "public-read" },
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
};
