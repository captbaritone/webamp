const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });

const s3 = new AWS.S3();

function getFile(key) {
  return new Promise((resolve, rejectPromise) => {
    const bucketName = "winamp2-js-skins";
    s3.getObject({ Bucket: bucketName, Key: key }, (err, data) => {
      if (err) {
        rejectPromise(err);
        return;
      }
      const body = Buffer.from(data.Body).toString("utf8");
      resolve(body);
    });
  });
}

function putFile(key, body) {
  return new Promise((resolve, rejectPromise) => {
    const bucketName = "winamp2-js-skins";
    s3.putObject({ Bucket: bucketName, Key: key, Body: body }, (err) => {
      if (err) {
        rejectPromise(err);
        return;
      }
      resolve();
    });
  });
}

function putSkin(md5, buffer) {
  return new Promise((resolve, rejectPromise) => {
    const bucketName = "webamp-uploaded-skins";
    const key = `skins/${md5}.wsz`;
    s3.putObject(
      { Bucket: bucketName, Key: key, Body: buffer, ACL: "public-read" },
      err => {
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
      err => {
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

function getLines(body) {
  return body
    .trim()
    .split("\n")
    .map((line) => line.trim());
}

async function getAllApproved() {
  return getLines(await getFile("approved.txt"));
}

async function getAllRejected() {
  return getLines(await getFile("rejected.txt"));
}

async function getAllTweeted() {
  return getLines(await getFile("tweeted.txt"));
}

async function getStatus(md5) {
  const [approved, rejected, tweeted] = await Promise.all([
    getFile("approved.txt"),
    getFile("rejected.txt"),
    getFile("tweeted.txt"),
  ]);
  const approvedSet = new Set(getLines(approved));
  const rejectedSet = new Set(getLines(rejected));
  const tweetedSet = new Set(getLines(tweeted));
  if (tweetedSet.has(md5)) {
    return "TWEETED";
  }
  if (rejectedSet.has(md5)) {
    return "REJECTED";
  }
  if (approvedSet.has(md5)) {
    return "APPROVED";
  }
  return "UNREVIEWED";
}

async function getStats() {
  const [approved, rejected, tweeted, tweetable] = await Promise.all([
    getFile("approved.txt"),
    getFile("rejected.txt"),
    getFile("tweeted.txt"),
    getTweetableSkins(),
  ]);
  return {
    approved: new Set(getLines(approved)).size,
    rejected: new Set(getLines(rejected)).size,
    tweeted: new Set(getLines(tweeted)).size,
    tweetable: tweetable.length,
  };
}

async function getSkinToReview() {
  const [filenames, approved, rejected, tweeted] = await Promise.all([
    getFile("filenames.txt"),
    getFile("approved.txt"),
    getFile("rejected.txt"),
    getFile("tweeted.txt"),
  ]);

  const approvedSet = new Set(getLines(approved));
  const rejectedSet = new Set(getLines(rejected));
  const tweetedSet = new Set(getLines(tweeted));

  const filenameLines = getLines(filenames);
  const skins = filenameLines.map((line) => {
    const [md5, ...filename] = line.split(" ");
    return { md5, filename: filename.join(" ") };
  });
  return skins.find(({ md5 }) => {
    return !(
      approvedSet.has(md5) ||
      rejectedSet.has(md5) ||
      tweetedSet.has(md5)
    );
  });
}

async function getTweetableSkins() {
  const [filenames, approved, rejected, tweeted] = await Promise.all([
    getFile("filenames.txt"),
    getFile("approved.txt"),
    getFile("rejected.txt"),
    getFile("tweeted.txt"),
  ]);

  const rejectedSet = new Set(getLines(rejected));
  const tweetedSet = new Set(getLines(tweeted));
  const approvedSet = new Set(getLines(approved));

  const filenameLines = getLines(filenames);
  return filenameLines
    .map((line) => {
      const [md5, ...filename] = line.split(" ");
      return { md5, filename: filename.join(" ") };
    })
    .filter(({ md5 }) => {
      return (
        approvedSet.has(md5) && !rejectedSet.has(md5) && !tweetedSet.has(md5)
      );
    });
}

async function appendLine(key, line) {
  const currentContent = await getFile(key);
  const newContent = `${currentContent}${line}\n`;
  return putFile(key, newContent);
}

async function approve(md5) {
  return appendLine("approved.txt", md5);
}

async function reject(md5) {
  return appendLine("rejected.txt", md5);
}

async function markAsTweeted(md5) {
  return appendLine("tweeted.txt", md5);
}

module.exports = {
  putScreenshot,
  putSkin,
  getSkinToReview,
  approve,
  reject,
  getStatus,
  getStats,
  markAsTweeted,
  getTweetableSkins,
  getAllApproved,
  getAllRejected,
  getAllTweeted,
};
