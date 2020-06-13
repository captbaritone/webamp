import db from "../db";
import path from "path";
import S3 from "../s3";
import logger from "../logger";
import { DBSkinRecord, SkinRecord, DBIARecord, TweetStatus } from "../types";
import fetch from "node-fetch";
import { analyseBuffer, NsfwPrediction } from "../nsfwImage";

const skins = db.get("skins");
const iaItems = db.get("internetArchiveItems");

const CLASSIC_QUERY = {
  type: "CLASSIC",
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
    tweeted,
    rejected,
    approved,
    nsfw,
    nsfwPredictions,
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
    tweeted,
    rejected,
    approved,
    nsfw,
    nsfwPredictions,
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

export async function getMd5ByAnything(
  anything: string
): Promise<string | null> {
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

export async function getReadme(md5: string) {
  return getProp(md5, "readmeText");
}

export async function getScreenshotUrl(md5: string): Promise<never> {
  // @ts-ignore
  return getProp(md5, "screenshotUrl");
}

export async function getSkinUrl(md5: string): Promise<never> {
  // @ts-ignore
  return getProp(md5, "skinUrl");
}

export async function getInternetArchiveItem(md5: string): Promise<DBIARecord> {
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

export async function getMd5sMatchingImageHash(imageHash: string) {
  return skins.find({ imageHash }, { md5: 1 });
}

export async function getUnarchived() {
  return skins.find({ itemName: null }, { md5: 1 });
}

export async function getMissingNsfwPredictions() {
  const results = await skins.find(
    { nsfwPredictions: null, type: "CLASSIC" },
    { md5: 1 }
  );
  return results.map(({ md5 }) => md5);
}

export function getInternetArchiveUrl(itemName: string | null): string | null {
  return itemName == null ? null : `https://archive.org/details/${itemName}`;
}

export function getTweetableSkinCount(): Promise<number> {
  return skins.count(TWEETABLE_QUERY);
}

export function getClassicSkinCount(): Promise<number> {
  return skins.count(CLASSIC_QUERY);
}

export async function markAsTweeted(md5: string): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { tweeted: true } });
  return S3.markAsTweeted(md5);
}

export async function markAsNSFW(md5: string): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { nsfw: true } });
}

export async function getStatus(md5: string): Promise<TweetStatus> {
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

export async function approve(md5: string): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { approved: true } });
  return S3.approve(md5);
}

export async function reject(md5: string): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { rejected: true } });
  return S3.reject(md5);
}

export async function getSkinToArchive(): Promise<{
  filename: string | null;
  md5: string;
}> {
  const reviewable = await skins.aggregate([
    { $match: CLASSIC_QUERY },
    {
      $lookup: {
        from: "internetArchiveItems",
        localField: "md5",
        foreignField: "md5",
        as: "archive",
      },
    },
    { $count: "5" },
  ]);
  const skin = reviewable[0];
  const { canonicalFilename, md5 } = getSkinRecord(skin);
  return { filename: canonicalFilename, md5 };
}

export async function getSkinToReview(): Promise<{
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

export async function getSkinToReviewForNsfw(): Promise<{
  filename: string | null;
  md5: string;
}> {
  const reviewable = await skins.find(REVIEWABLE_QUERY, {
    limit: 1,
    sort: { "nsfwPredictions.porn": -1 },
  });
  const skin = reviewable[0];
  const { canonicalFilename, md5 } = getSkinRecord(skin);
  return { filename: canonicalFilename, md5 };
}

export async function getSkinToTweet(): Promise<SkinRecord | null> {
  const tweetables = await skins.aggregate([
    { $match: TWEETABLE_QUERY },
    { $sample: { size: 1 } },
  ]);
  const skin = tweetables[0];
  if (skin == null) {
    return null;
  }
  return getSkinRecord(skin);
}

export async function getStats(): Promise<{
  approved: number;
  rejected: number;
  tweeted: number;
  tweetable: number;
}> {
  const approved = await skins.count({ approved: true });
  const rejected = await skins.count({ rejected: true });
  const tweeted = await skins.count({ tweeted: true });
  const tweetable = await getTweetableSkinCount();
  return { approved, rejected, tweeted, tweetable };
}

export async function reconcile(): Promise<void> {
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

export async function setImageHash(
  md5: string,
  imageHash: string
): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { imageHash } });
}

export async function getRandomClassicSkinMd5() {
  const random = await skins.aggregate([
    { $match: CLASSIC_QUERY },
    { $sample: { size: 1 } },
  ]);
  if (random.length === 0) {
    return null;
  }
  return random[0].md5;
}

export async function getScreenshotBuffer(md5: string): Promise<Buffer> {
  const skin = await getSkinByMd5(md5);
  if (skin == null) {
    throw new Error(`Could not find skin with hash ${md5}`);
  }
  const screenshotResponse = await fetch(skin?.screenshotUrl);
  if (!screenshotResponse.ok) {
    throw new Error(`Could not get screenshot at ${skin?.screenshotUrl}`);
  }
  return screenshotResponse.buffer();
}

export async function setNsfwPredictions(
  md5: string,
  nsfwPredictions: NsfwPrediction
): Promise<void> {
  await skins.findOneAndUpdate({ md5 }, { $set: { nsfwPredictions } });
}

export async function setTweetInfo(
  md5: string,
  likes: number,
  tweetId: string
): Promise<void> {
  if (md5 === "48bbdbbeb03d347e59b1eebda4d352d0") {
    console.log(likes, tweetId);
  }
  await skins.findOneAndUpdate(
    { md5 },
    { $set: { twitterLikes: likes, tweetId } }
  );
}

export async function computeAndSetNsfwPredictions(md5: string): Promise<void> {
  const image = await getScreenshotBuffer(md5);
  const predictions = await analyseBuffer(image);
  await setNsfwPredictions(md5, predictions);
}

export async function getMuseumPage({
  offset,
  first,
}: {
  offset: number;
  first: number;
}): Promise<
  Array<{ color: string; fileName: string; md5: string; nsfw: boolean }>
> {
  const reviewable = await skins.find(
    { type: "CLASSIC" },
    {
      limit: first,
      skip: offset,
      sort: { twitterLikes: -1, approved: -1, rejected: 1 },
      fields: { averageColor: 1, md5: 1, nsfw: 1 },
    }
  );

  return reviewable.map(({ md5, averageColor, nsfw }) => {
    return {
      color: averageColor,
      filename: "FILENAME",
      md5,
      nsfw,
    };
  });
}
