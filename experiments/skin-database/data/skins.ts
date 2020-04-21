import db from "../db";
import path from "path";
import S3 from "../s3";
import logger from "../logger";
const skins = db.get("skins");
const iaItems = db.get("internetArchiveItems");

type TweetStatus = "APPROVED" | "REJECTED" | "TWEETED" | "UNREVIEWED";

type DBSkinRecord = {
  md5: string;
  averageColor?: string;
  emails?: string[];
  tweetUrl?: string;
  twitterLikes?: number;
  readmeText?: string;
  filePaths: string[];
  imageHash?: string;
  uploader?: string;
};

type DBIARecord = {
  identifier: string;
};

type SkinRecord = {
  md5: string;
  averageColor?: string;
  emails?: string[];
  tweetUrl?: string;
  twitterLikes?: number;
  readmeText?: string;
  fileNames: string[];
  imageHash?: string;
  uploader?: string;
  screenshotUrl: string;
  skinUrl: string;
  canonicalFilename: string | null;
  webampUrl: string;
};

const TWEETABLE_QUERY = {
  tweeted: { $ne: true },
  approved: true,
  rejected: { $ne: true },
  type: "CLASSIC",
};

const REVIEWABLE_QUERY = {
  tweeted: { $ne: true },
  approved: { $ne: true },
  rejected: { $ne: true },
  type: "CLASSIC",
};

function getSkinRecord(skin: DBSkinRecord): SkinRecord {
  const {
    md5,
    averageColor,
    emails,
    tweetUrl,
    twitterLikes,
    readmeText,
    filePaths,
    imageHash,
    uploader,
  } = skin;
  const fileNames = filePaths.map((p) => path.basename(p));
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
    imageHash,
    uploader,
  };
}

async function getProp<T extends keyof DBSkinRecord>(
  md5: string,
  prop: T
): Promise<DBSkinRecord[T]> {
  const skin = await skins.findOne({ md5, type: "CLASSIC" });
  const value = skin && skin[prop];
  return value == null ? null : value;
}

export async function addSkin({ md5, filePath, uploader, averageColor }) {
  skins.insert({
    md5,
    type: "CLASSIC",
    filePaths: [filePath],
    uploader,
    averageColor,
  });
}

const IA_URL = /^(https:\/\/)?archive.org\/details\/([^\/]+)\/?/;
const MD5 = /([a-fA-F0-9]{32})/;

async function getMd5ByAnything(anything: string): Promise<string | null> {
  const md5Match = anything.match(MD5);
  if (md5Match != null) {
    const md5 = md5Match[1];
    const found = await skins.findOne({ md5, type: "CLASSIC" });
    if (found != null) {
      return md5;
    }
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

  const imageHashMd5 = await getMd5FromImageHash(anything);

  return imageHashMd5;
}

export async function getSkinByMd5(md5: string) {
  const skin = await skins.findOne({ md5, type: "CLASSIC" });
  if (skin == null) {
    logger.warn("Could not find skin in database", { md5, alert: true });
    return null;
  }
  const internetArchiveItem = await getInternetArchiveItem(md5);
  let internetArchiveUrl: string | null = null;
  let internetArchiveItemName: string | null = null;
  if (internetArchiveItem != null) {
    internetArchiveItemName = internetArchiveItem.identifier;
    internetArchiveUrl = getInternetArchiveUrl(internetArchiveItemName);
  }
  const tweetStatus = await getStatus(md5);
  return {
    ...getSkinRecord(skin),
    tweetStatus,
    internetArchiveItemName,
    internetArchiveUrl,
  };
}

async function getReadme(md5: string) {
  return getProp(md5, "readmeText");
}

async function getScreenshotUrl(md5: string): Promise<never> {
  // @ts-ignore
  return getProp(md5, "screenshotUrl");
}

async function getSkinUrl(md5: string): Promise<never> {
  // @ts-ignore
  return getProp(md5, "skinUrl");
}

async function getInternetArchiveItem(md5: string): Promise<DBIARecord> {
  return iaItems.findOne({ md5: md5 });
}

async function getMd5FromInternetArchvieItemName(itemName: string) {
  const item = await iaItems.findOne({ identifier: itemName }, { md5: 1 });
  return item == null ? null : item.md5;
}

async function getMd5FromImageHash(imageHash: string): Promise<string | null> {
  const item: { md5: string } | null = await skins.findOne(
    { imageHash },
    { md5: 1 }
  );
  return item == null ? null : item.md5;
}

async function getMd5sMatchingImageHash(imageHash: string) {
  return skins.find({ imageHash }, { md5: 1 });
}

function getInternetArchiveUrl(itemName: string | null): string | null {
  return itemName == null ? null : `https://archive.org/details/${itemName}`;
}

function getTweetableSkinCount(): number {
  return skins.count(TWEETABLE_QUERY);
}

async function markAsTweeted(md5): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { tweeted: true } });
  return S3.markAsTweeted(md5);
}

async function getStatus(md5: string): Promise<TweetStatus> {
  const skin = await skins.findOne({ md5 });
  if (skin.tweeted) {
    return "TWEETED";
  }
  if (skin.rejected) {
    return "REJECTED";
  }
  if (skin.approved) {
    return "APPROVED";
  }
  return "UNREVIEWED";
}

async function approve(md5: string): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { approved: true } });
  return S3.approve(md5);
}

async function reject(md5: string): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { rejected: true } });
  return S3.reject(md5);
}

async function getSkinToReview(): Promise<{
  filename: string | null;
  md5: string;
}> {
  const reviewable = await skins.aggregate([
    { $match: REVIEWABLE_QUERY },
    { $sample: { size: 1 } },
  ]);
  const skin = reviewable[0];
  const { canonicalFilename, md5 } = getSkinRecord(skin);
  return { filename: canonicalFilename, md5 };
}

async function getSkinToTweet() {
  const tweetables = await skins.aggregate([
    { $match: TWEETABLE_QUERY },
    { $sample: { size: 1 } },
  ]);
  const skin = tweetables[0];
  if (skin == null) {
    return null;
  }
  const { canonicalFilename, md5 } = getSkinRecord(skin);
  return { filename: canonicalFilename, md5 };
}

async function getStats(): Promise<{
  approved: number;
  rejected: number;
  tweeted: number;
  tweetable: number;
}> {
  const approved = await skins.count({ approved: true });
  const rejected = await skins.count({ rejected: true });
  const tweeted = await skins.count({ tweeted: true });
  const tweetable = getTweetableSkinCount();
  return { approved, rejected, tweeted, tweetable };
}

async function reconcile(): Promise<void> {
  const [approved, rejected, tweeted] = await Promise.all([
    S3.getAllApproved(),
    S3.getAllRejected(),
    S3.getAllTweeted(),
  ]);
  await Promise.all([
    ...approved.map((md5) =>
      skins.findOneAndUpdate({ md5 }, { $set: { approved: true } })
    ),
    ...rejected.map((md5) =>
      skins.findOneAndUpdate({ md5 }, { $set: { rejected: true } })
    ),
    ...tweeted.map((md5) =>
      skins.findOneAndUpdate({ md5 }, { $set: { tweeted: true } })
    ),
  ]);
}

async function setImageHash(md5: string, imageHash: string): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { imageHash } });
}

module.exports = {
  addSkin,
  getMd5sMatchingImageHash,
  getInternetArchiveItem,
  getMd5ByAnything,
  getReadme,
  getScreenshotUrl,
  getSkinUrl,
  getInternetArchiveUrl,
  getSkinByMd5,
  markAsTweeted,
  getStatus,
  approve,
  reject,
  getSkinToReview,
  getStats,
  getTweetableSkinCount,
  reconcile,
  getSkinToTweet,
  setImageHash,
};
