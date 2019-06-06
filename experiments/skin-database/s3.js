const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });

const s3 = new AWS.S3();

function getFile(key) {
  return new Promise((resolve, reject) => {
    const bucketName = "winamp2-js-skins";
    s3.getObject({ Bucket: bucketName, Key: key }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const body = Buffer.from(data.Body).toString("utf8");
      resolve(body);
    });
  });
}

function putFile(key, body) {
  return new Promise((resolve, reject) => {
    const bucketName = "winamp2-js-skins";
    s3.putObject({ Bucket: bucketName, Key: key, Body: body }, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function getLines(body) {
  return body.split("\n").map(line => line.trim());
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
  const [approved, rejected, tweeted] = await Promise.all([
    getFile("approved.txt"),
    getFile("rejected.txt"),
    getFile("tweeted.txt"),
  ]);
  return {
    approved: new Set(approved).size - new Set(tweeted).size,
    rejected: new Set(rejected).size,
    tweeted: new Set(tweeted).size,
  };
}

async function getSkinToReview() {
  console.log("Reading from s3...");
  const [filenames, approved, rejected, tweeted] = await Promise.all([
    getFile("filenames.txt"),
    getFile("approved.txt"),
    getFile("rejected.txt"),
    getFile("tweeted.txt"),
  ]);
  console.log("Got all files");

  const approvedSet = new Set(getLines(approved));
  const rejectedSet = new Set(getLines(rejected));
  const tweetedSet = new Set(getLines(tweeted));

  const filenameLines = getLines(filenames);
  const skins = filenameLines.map(line => {
    const [md5, ...filename] = line.split(" ");
    return { md5, filename: filename.join(" ") };
  });
  const toReview = skins.filter(({ md5 }) => {
    return !(
      approvedSet.has(md5) ||
      rejectedSet.has(md5) ||
      tweetedSet.has(md5)
    );
  });
  console.log(toReview.length, "skins to review");
  return toReview[0];
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

module.exports = { getSkinToReview, approve, reject, getStatus, getStats };
