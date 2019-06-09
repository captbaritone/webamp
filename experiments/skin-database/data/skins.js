const db = require("../db");
const path = require("path");
const skins = db.get("skins");
const iaItems = db.get("internetArchiveItems");
const S3 = require("../s3");

function getSkinRecord(skin) {
  const {
    md5,
    averageColor,
    emails,
    tweetUrl,
    twitterLikes,
    readmeText,
    filePaths,
  } = skin;
  console.log(skin);
  const fileNames = filePaths.map(p => path.basename(p));
  const skinUrl = `https://s3.amazonaws.com/webamp-uploaded-skins/skins/${md5}.wsz`;
  return {
    skinUrl,
    screenshotUrl: `https://s3.amazonaws.com/webamp-uploaded-skins/screenshots/${md5}.png`,
    md5,
    averageColor,
    fileNames,
    canonicalFilename: fileNames != null ? fileNames[0] : null,
    emails,
    tweetUrl,
    twitterLikes,
    webampUrl: `https://webamp.org?skinUrl=${skinUrl}`,
    readmeText,
  };
}

async function getProp(md5, prop) {
  const skin = await skins.findOne({ md5, type: "CLASSIC" });
  const value = skin && skin[prop];
  return value == null ? null : value;
}

async function getSkinByMd5(md5) {
  const skin = await skins.findOne({ md5, type: "CLASSIC" });
  if (skin == null) {
    return null;
  }
  const internetArchiveItemName = await getInternetArchiveItemName(md5);
  const internetArchiveUrl = await getInternetArchiveUrl(md5);
  const tweetStatus = await getTweetStatus(md5);
  return {
    ...getSkinRecord(skin),
    internetArchiveUrl,
    internetArchiveItemName,
    tweetStatus,
  };
}

async function getReadme(md5) {
  return getProp(md5, "readmeText");
}

async function getScreenshotUrl(md5) {
  return getProp(md5, "screenshotUrl");
}

async function getSkinUrl(md5) {
  return getProp(md5, "skinUrl");
}

async function getInternetArchiveItemName(md5) {
  const item = await getInternetArchiveItem(md5);
  if (item == null) {
    return null;
  }
  return item.identifier;
}
async function getInternetArchiveItem(md5) {
  return iaItems.findOne(
    { "metadata.files.md5": md5 },
    {
      fields: {
        metadata: 1,
        identifier: 1,
      },
    }
  );
}

async function getInternetArchiveUrl(md5) {
  const itemName = await getInternetArchiveItemName(md5);
  if (itemName == null) {
    return null;
  }
  return `https://archive.org/details/${itemName}`;
}

async function getTweetStatus(md5) {
  return S3.getStatus(md5);
}

module.exports = {
  getReadme,
  getScreenshotUrl,
  getSkinUrl,
  getInternetArchiveUrl,
  getTweetStatus,
  getSkinByMd5,
};
