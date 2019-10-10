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

const IA_URL = /^(https:\/\/)?archive.org\/details\/([^\/]+)\/?/;
const MD5 = /([a-fA-F0-9]{32})/;

async function getMd5ByAnything(anything) {
  const md5Match = anything.match(MD5);
  if (md5Match != null) {
    const md5 = md5Match[1];
    return md5;
  }
  const itemMatchResult = anything.match(IA_URL);
  if (itemMatchResult != null) {
    const itemName = itemMatchResult[2];
    const md5 = await getMd5FromInternetArchvieItemName(itemName);
    if (md5 != null) {
      return md5;
    }
  }
  const md5 = await getMd5FromInternetArchvieItemName(anything);
  if (md5 != null) {
    return md5;
  }
}

async function getSkinByMd5(md5) {
  const skin = await skins.findOne({ md5, type: "CLASSIC" });
  if (skin == null) {
    return null;
  }
  const internetArchiveItem = await getInternetArchiveItem(md5);
  if(internetArchiveItem == null) {
    return null;
  }
  const itemName = internetArchiveItem.identifier;
  const tweetStatus = await getTweetStatus(md5);
  return {
    ...getSkinRecord(skin),
    internetArchiveUrl: getInternetArchiveUrl(itemName),
    internetArchiveItemName: itemName,
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

async function getInternetArchiveItem(md5) {
  return iaItems.findOne({ md5: md5 });
}

async function getMd5FromInternetArchvieItemName(itemName) {
  const item = await iaItems.findOne({ identifier: itemName }, { md5: 1 });
  return item == null ? null : item.md5;
}

function getInternetArchiveUrl(itemName) {
  return itemName == null ? null : `https://archive.org/details/${itemName}`;
}

async function getTweetStatus(md5) {
  return S3.getStatus(md5);
}

module.exports = {
  getMd5ByAnything,
  getReadme,
  getScreenshotUrl,
  getSkinUrl,
  getInternetArchiveUrl,
  getTweetStatus,
  getSkinByMd5,
};
