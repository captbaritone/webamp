import { db, knex } from "../db";
import path from "path";
import logger from "../logger";
import md5Hash from "md5";
import { searchIndex } from "../algolia";
import { truncate, MD5_REGEX } from "../utils";
import { DBSkinRecord, SkinRecord, DBIARecord, TweetStatus } from "../types";
import fetch from "node-fetch";
import * as S3 from "../s3";

export const SKIN_TYPE = {
  CLASSIC: 1,
  MODERN: 2,
  PACK: 3,
  INVALID: 4,
};

const skins_DEPRECATED = db.get("skins");
const skins_CONVERTED = db.get("skins");
const iaItems = db.get("internetArchiveItems");

function getFilenames(skin: DBSkinRecord): string[] {
  return skin.filePaths.map((p) => path.basename(p));
}

function getCanonicalFilename(skin: DBSkinRecord): string | null {
  const fileNames = getFilenames(skin);
  return fileNames[0] || null;
}

export function getSkinUrl(md5: string): string {
  return `https://cdn.webampskins.org/skins/${md5}.wsz`;
}
function getScreenshotUrl(md5: string): string {
  return `https://cdn.webampskins.org/screenshots/${md5}.png`;
}

function getWebampUrl(md5: string): string {
  return `https://webamp.org?skinUrl=${getSkinUrl(md5)}`;
}

export function getMuseumUrl(md5: string): string {
  return `https://skins.webamp.org/skin/${md5}`;
}

export async function addSkin({
  md5,
  filePath,
  uploader,
  averageColor,
  modern,
  readmeText,
}: {
  md5: string;
  filePath: string;
  uploader: string;
  averageColor?: string;
  modern: boolean;
  readmeText: string | null;
}) {
  skins_CONVERTED.insert({
    md5,
    type: modern ? "MODERN" : "CLASSIC",
    filePaths: [filePath],
    uploader,
    averageColor,
    readmeText,
  });
  await knex("skins").insert(
    {
      md5,
      skin_type: modern ? SKIN_TYPE.MODERN : SKIN_TYPE.CLASSIC,
      average_color: averageColor,
      readme_text: readmeText,
    },
    []
  );
  await knex("files").insert(
    {
      skin_md5: md5,
      file_path: filePath,
      source_attribution: uploader,
    },
    []
  );
}

const IA_URL = /^(https:\/\/)?archive.org\/details\/([^\/]+)\/?/;

const CRUFT_FILENAME = /winampskins\.info\.(html)|(txt)$/;

export async function setContentHash(md5: string): Promise<string | null> {
  const files = await knex("archive_files").where("skin_md5", md5).select();
  if (files.length === 0) {
    return null;
  }

  const contentHash = md5Hash(
    files
      .filter(({ file_name }) => !CRUFT_FILENAME.test(file_name))
      .map(({ file_name, file_md5 }) => `${file_name}:${file_md5}`)
      .sort()
      .join("|")
  );

  await knex("skins").update({ content_hash: contentHash }).where("md5", md5);
  return contentHash;
}

// TODO: SQLITE
export async function getMd5ByAnything(
  anything: string
): Promise<string | null> {
  const md5Match = anything.match(MD5_REGEX);
  if (md5Match != null) {
    const md5 = md5Match[1];
    const found = await knex("skins").where({ md5, skin_type: 1 }).first();
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
  return getMd5FromInternetArchvieItemName(anything);
}

export async function skinExists(md5: string): Promise<boolean> {
  const skin = await knex("skins").where({ md5 }).first();
  return skin != null;
}

export async function getSkinMuseumData(
  md5: string
): Promise<{ nsfw: boolean; fileName: string; md5: string } | null> {
  const result = await knex("skins")
    .where("md5", md5)
    .leftJoin("files", "files.skin_md5", "=", "skins.md5")
    .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
    .groupBy("skins.md5")
    .first([
      "md5",
      "file_path",
      knex.raw("skin_reviews.review = 'NSFW' AS nsfw"),
    ]);

  if (result == null) {
    return null;
  }

  return {
    md5: result.md5,
    nsfw: Boolean(result.nsfw),
    fileName: path.basename(result.file_path),
  };
}

// TODO: SQLITE
// TODO: Handle modern skins
export async function getSkinByMd5_DEPRECATED(
  md5: string
): Promise<SkinRecord | null> {
  const _skin: DBSkinRecord | null = await skins_DEPRECATED.findOne({
    md5,
    type: "CLASSIC",
  });
  if (_skin == null) {
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
    // ...skin,
    md5: _skin.md5,
    readmeText: _skin.readmeText,
    type: _skin.type,
    filePaths: _skin.filePaths,
    tweetId: _skin.tweetId,
    tweeted: _skin.tweeted,
    tweetUrl: _skin.tweetUrl,
    twitterLikes: _skin.twitterLikes,
    imageHash: _skin.imageHash,
    nsfwPredictions: _skin.nsfwPredictions,
    approved: _skin.approved,
    rejected: _skin.rejected,
    averageColor: _skin.averageColor,
    emails: _skin.emails,
    tweetStatus,
    skinUrl: getSkinUrl(_skin.md5),
    screenshotUrl: getScreenshotUrl(_skin.md5),
    fileNames: getFilenames(_skin),
    canonicalFilename: getCanonicalFilename(_skin),
    webampUrl: getWebampUrl(_skin.md5),
    museumUrl: getMuseumUrl(_skin.md5),
    internetArchiveItemName,
    internetArchiveUrl,
  };
}

async function getInternetArchiveItem(md5: string): Promise<DBIARecord> {
  return iaItems.findOne({ md5: md5 });
}

async function getMd5FromInternetArchvieItemName(itemName: string) {
  const item = await knex("ia_items")
    .where({ identifier: itemName })
    .first("skin_md5");
  return item == null ? null : item.skin_md5;
}

export function getInternetArchiveUrl(itemName: string | null): string | null {
  return itemName == null ? null : `https://archive.org/details/${itemName}`;
}

export async function getTweetableSkinCount(): Promise<number> {
  const tweetable = await knex("skins")
    .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
    .leftJoin("tweets", "tweets.skin_md5", "=", "skins.md5")
    .where({
      "tweets.id": null,
      skin_type: 1,
      "skin_reviews.review": "APPROVED",
    })
    .count("skins.id", { as: "count" })
    .first();
  return Number(tweetable?.count ?? 0);
}

export async function getClassicSkinCount(): Promise<number> {
  const rows = await knex("skins")
    .where({ skin_type: 1 })
    .count({ count: "*" });
  const row = rows[0];
  if (row == null || row.count == null) {
    throw new Error("Could not find count row");
  }
  const { count } = row;
  if (count == null) {
    throw new Error("Could not find count");
  }
  return Number(count);
}

// TODO: Also pass id
export async function markAsTweeted(md5: string, url: string): Promise<void> {
  await skins_CONVERTED.findOneAndUpdate({ md5 }, { $set: { tweeted: true } });
  await knex("tweets").insert({ skin_md5: md5, url }, []);
}

// TODO: Also path actor
export async function markAsNSFW(md5: string): Promise<void> {
  await skins_CONVERTED.findOneAndUpdate({ md5 }, { $set: { nsfw: true } });
  const index = { objectID: md5, nsfw: true };
  // TODO: Await here, but for some reason this never completes
  await searchIndex.partialUpdateObjects([index]);
  await recordSearchIndexUpdates(md5, Object.keys(index));
  await knex("skin_reviews").insert({ skin_md5: md5, review: "NSFW" }, []);
}

export async function getStatus(md5: string): Promise<TweetStatus> {
  const tweeted = await knex("tweets").where({ skin_md5: md5 }).limit(1);
  if (tweeted.length > 0) {
    return "TWEETED";
  }
  const reviewRows = await knex("skin_reviews")
    .where({ skin_md5: md5 })
    .limit(1);
  const reviews = new Set(reviewRows.map((row) => row.review));
  if (reviews.has("REJECTED")) {
    return "REJECTED";
  }
  if (reviews.has("APPROVED")) {
    return "APPROVED";
  }

  return "UNREVIEWED";
}

export async function getUploadStatuses(
  md5s: string[]
): Promise<{ [md5: string]: string }> {
  const skins = await knex("skin_uploads")
    .whereIn("skin_md5", md5s)
    .select("skin_md5", "status");

  const statuses: { [md5: string]: string } = {};
  skins.forEach(({ skin_md5, status }) => {
    statuses[skin_md5] = status;
  });

  return statuses;
}

type SearchIndex = {
  objectID: string;
  md5: string;
  nsfw: boolean;
  fileName: string;
  twitterLikes: number;
};

async function getSearchIndexes(md5s: string[]): Promise<SearchIndex[]> {
  const skins = await knex("skins")
    .leftJoin("tweets", "tweets.skin_md5", "=", "skins.md5")
    .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
    .leftJoin("files", "files.skin_md5", "=", "skins.md5")
    .where("skin_type", SKIN_TYPE.CLASSIC)
    .whereIn("md5", md5s)
    .groupBy("skins.md5")
    .select(
      "skins.md5",
      "skins.readme_text",
      "tweets.likes",
      "skin_reviews.review",
      "files.file_path"
    );

  return skins.map((skin) => {
    return {
      objectID: skin.md5,
      md5: skin.md5,
      nsfw: skin.review === "NSFW",
      readmeText: skin.readme_text ? truncate(skin.readme_text, 4800) : null,
      fileName: path.basename(skin.file_path),
      twitterLikes: Number(skin.likes || 0),
    };
  });
}

export async function updateSearchIndexs(md5s: string[]): Promise<{}> {
  const skinIndexes = await getSearchIndexes(md5s);

  const results = await searchIndex.partialUpdateObjects(skinIndexes, {
    createIfNotExists: true,
  });

  for (const index of skinIndexes) {
    await recordSearchIndexUpdates(index.md5, Object.keys(index));
  }
  return results;
}

export async function updateSearchIndex(md5: string): Promise<{} | null> {
  return updateSearchIndexs([md5]);
}

export async function deleteSkin(md5: string): Promise<void> {
  console.log(`Deleting skin ${md5}...`);
  console.log(`... mongodb record`);
  await skins_DEPRECATED.remove({ md5 }, { multi: false });
  console.log(`... sqlite "skins"`);
  await knex("skins").where({ md5 }).limit(1).delete();
  console.log(`... sqlite "files"`);
  await knex("files").where({ skin_md5: md5 }).delete();
  console.log(`... sqlite "skin_reviews"`);
  await knex("skin_reviews").where({ skin_md5: md5 }).delete();
  console.log(`... sqlite "ia_items"`);
  await knex("ia_items").where({ skin_md5: md5 }).delete();
  console.log(`... sqlite "nsfw_predictions"`);
  await knex("nsfw_predictions").where({ skin_md5: md5 }).delete();
  console.log(`... sqlite "archive_files"`);
  await knex("archive_files").where({ skin_md5: md5 }).delete();
  console.log(`... removing from Algolia index`);
  await searchIndex.deleteObjects([md5]);
  console.log(`... removing skin from S3`);
  await S3.deleteSkin(md5);
  console.log(`... removing screenshot from S3`);
  await S3.deleteScreenshot(md5);
  console.log(`Done deleting skin ${md5}.`);
}

export async function recordSearchIndexUpdates(
  md5: string,
  fields: string[]
): Promise<void> {
  const update_timestamp = Math.floor(Date.now() / 1000);

  await knex("algolia_field_updates").insert(
    Object.keys(fields).map((field) => ({
      skin_md5: md5,
      update_timestamp,
      field,
    }))
  );
}

export async function getReportedUpload(): Promise<{
  skin_md5: string;
  id: string;
  filename: string;
} | null> {
  const found = await knex("skin_uploads")
    .where("status", "UPLOAD_REPORTED")
    .first(["skin_md5", "id", "filename"]);
  return found || null;
}

export async function recordUserUploadComplete(
  md5: string,
  id: string
): Promise<void> {
  const result = await knex("skin_uploads")
    .where({ skin_md5: md5, id, status: "URL_REQUESTED" })
    .update({ status: "UPLOAD_REPORTED" }, [id])
    .limit(1);
  console.log("recordUserUploadComplete", result);
}

export async function recordUserUploadArchived(id: string): Promise<void> {
  const result = await knex("skin_uploads")
    .where({ id })
    .update({ status: "ARCHIVED" }, [id])
    .limit(1);
  console.log("recordUserUploadArchived", result);
}

export async function recordUserUploadErrored(id: string): Promise<void> {
  const result = await knex("skin_uploads")
    .where({ id })
    .update({ status: "ERRORED" }, [id])
    .limit(1);
  console.log("recordUserUploadErrored", result);
}

export async function recordUserUploadRequest(
  md5: string,
  filename: string
): Promise<string> {
  const record = await knex("skin_uploads").insert(
    { skin_md5: md5, status: "URL_REQUESTED", filename },
    ["id"]
  );
  return record[0];
}

// TODO: Also path actor
export async function approve(md5: string): Promise<void> {
  await skins_CONVERTED.findOneAndUpdate({ md5 }, { $set: { approved: true } });
  await knex("skin_reviews").insert({ skin_md5: md5, review: "APPROVED" }, []);
}

// TODO: Also path actor
export async function reject(md5: string): Promise<void> {
  await skins_CONVERTED.findOneAndUpdate({ md5 }, { $set: { rejected: true } });
  await knex("skin_reviews").insert({ skin_md5: md5, review: "REJECTED" }, []);
}

export async function getSkinToReview(): Promise<{
  filename: string | null;
  md5: string;
}> {
  const skins = await knex("skins")
    .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
    .leftJoin("tweets", "tweets.skin_md5", "=", "skins.md5")
    .innerJoin("files", "files.skin_md5", "=", "skins.md5")
    .select("skins.md5", "files.file_path")
    .where({ "skin_reviews.id": null, "tweets.id": null, "skins.skin_type": 1 })
    // TODO: Remove this once we run out of skins that don't have it.
    .whereNot("emails", "like", "%Dr.Algebra@gmx.de%")
    .orderByRaw("random()")
    .limit(1);
  if (!skins.length) {
    throw new Error("Could not find any skins to review");
  }
  const skin = skins[0];
  return { filename: path.basename(skin.file_path), md5: skin.md5 };
}

export async function getSkinToReviewForNsfw(): Promise<{
  filename: string | null;
  md5: string;
}> {
  // TODO: This will not surface skins which have already been reviewed for the bot but not for NSFW.
  const skins = await knex("skins")
    .leftJoin("nsfw_predictions", "nsfw_predictions.skin_md5", "=", "skins.md5")
    .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
    .innerJoin("files", "files.skin_md5", "=", "nsfw_predictions.skin_md5")
    .select("nsfw_predictions.skin_md5", "files.file_path")
    .where({ "skin_reviews.id": null, skin_type: 1 })
    .orderBy("nsfw_predictions.porn", "desc")
    .limit(1);
  if (!skins.length) {
    throw new Error("Could not find any skins to review");
  }
  const skin = skins[0];
  return { filename: path.basename(skin.file_path), md5: skin.skin_md5 };
}

export async function getSkinToTweet(): Promise<{
  md5: string;
  canonicalFilename: string;
} | null> {
  // TODO: This does not account for skins that have been both approved and rejected
  const tweetables = await knex("skins")
    .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
    .leftJoin("tweets", "tweets.skin_md5", "=", "skins.md5")
    .leftJoin("files", "files.skin_md5", "=", "skins.md5")
    .where({
      "tweets.id": null,
      skin_type: 1,
      "skin_reviews.review": "APPROVED",
    })
    .groupBy("skins.md5")
    .select(["skins.md5", "files.file_path"])
    .orderByRaw("random()")
    .limit(1);
  const skin = tweetables[0];
  if (skin == null) {
    return null;
  }
  return { md5: skin.md5, canonicalFilename: path.basename(skin.file_path) };
}

export async function getStats(): Promise<{
  approved: number;
  rejected: number;
  nsfw: number;
  tweeted: number;
  tweetable: number;
  webUploads: number;
}> {
  const approved = (
    await knex("skin_reviews")
      .first(knex.raw(`COUNT(DISTINCT skin_md5) AS "approved_count"`))
      .where({ review: "APPROVED" })
  ).approved_count;
  const rejected = (
    await knex("skin_reviews")
      .first(knex.raw(`COUNT(DISTINCT skin_md5) AS "rejected_count"`))
      .where({ review: "REJECTED" })
  ).rejected_count;
  const nsfw = (
    await knex("skin_reviews")
      .first(knex.raw(`COUNT(DISTINCT skin_md5) AS "nsfw_count"`))
      .where({ review: "NSFW" })
  ).nsfw_count;
  const tweeted = (await knex("tweets").count("*", { as: "tweeted" }))[0]
    .tweeted;
  const webUploads = (
    await knex("files")
      .where("source_attribution", "Web API")
      .count("*", { as: "uploads" })
  )[0].uploads;
  const tweetable = await getTweetableSkinCount();
  return {
    approved: Number(approved),
    rejected: Number(rejected),
    nsfw: Number(nsfw),
    tweeted: Number(tweeted),
    tweetable,
    webUploads: Number(webUploads),
  };
}

export async function getRandomClassicSkinMd5(): Promise<string> {
  return (await knex("skins").orderByRaw("random()").first("md5")).md5;
}

export async function getScreenshotBuffer(md5: string): Promise<Buffer> {
  const exists = await skinExists(md5);
  if (!exists) {
    throw new Error(`Could not find skin with hash ${md5}`);
  }

  const screenshotUrl = getScreenshotUrl(md5);
  const screenshotResponse = await fetch(screenshotUrl);
  if (!screenshotResponse.ok) {
    throw new Error(`Could not get screenshot at ${screenshotUrl}`);
  }
  return screenshotResponse.buffer();
}

export async function setTweetInfo(
  md5: string,
  likes: number,
  retweets: number,
  tweetId: string
): Promise<void> {
  await skins_CONVERTED.findOneAndUpdate(
    { md5 },
    { $set: { twitterLikes: likes, tweetId } }
  );
  const first = await knex("tweets")
    .where({ skin_md5: md5 })
    .first(["likes", "retweets"]);
  if (first == null) {
    await knex("skins").insert(
      {
        skin_md5: md5,
        tweet_id: tweetId,
        likes,
        retweets,
      },
      []
    );
  } else {
    await knex("tweets")
      .where({ skin_md5: md5 })
      .update({ tweet_id: tweetId, likes, retweets }, []);
  }
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
  const skins = await knex.raw(
    `
SELECT skins.md5, 
    skin_reviews.review = 'NSFW'     AS nsfw, 
    skin_reviews.review = 'APPROVED' AS approved, 
    skin_reviews.review = 'REJECTED' AS rejected, 
    (IFNULL(tweets.likes, 0) + (IFNULL(tweets.retweets,0) * 1.5)) AS tweet_score,
	files.file_path,
  CASE skins.md5 
   WHEN "5e4f10275dcb1fb211d4a8b4f1bda236" THEN 0 -- Base
   WHEN "cd251187a5e6ff54ce938d26f1f2de02" THEN 1 -- Winamp3 Classified
   WHEN "b0fb83cc20af3abe264291bb17fb2a13" THEN 2 -- Winamp5 Classified
   WHEN "d6010aa35bed659bc1311820daa4b341" THEN 3 -- Bento Classified
   ELSE 1000
  END priority
FROM   skins 
    LEFT JOIN tweets ON tweets.skin_md5 = skins.md5 
    LEFT JOIN skin_reviews ON skin_reviews.skin_md5 = skins.md5
	LEFT JOIN files ON files.skin_md5 = skins.md5
WHERE  skin_type = 1 
GROUP BY skins.md5
ORDER  BY 
      priority ASC,
       tweet_score DESC, 
       nsfw ASC, 
       approved DESC, 
       rejected ASC
LIMIT ? offset ?`,
    [first, offset]
  );

  return skins.map(({ md5, nsfw, file_path }) => {
    return {
      fileName: path.basename(file_path),
      md5,
      nsfw: Boolean(nsfw),
    };
  });
}

export async function getAllClassicScreenshotUrls(): Promise<
  Array<{ fileName: string; url: string }>
> {
  const skins = await knex.raw(
    `
SELECT skins.md5, 
	files.file_path
FROM   skins 
	LEFT JOIN files ON files.skin_md5 = skins.md5
WHERE  skin_type = 1 
GROUP BY skins.md5`,
    []
  );

  return skins.map(({ md5, file_path }) => {
    return {
      fileName: path.basename(file_path),
      url: getScreenshotUrl(md5),
    };
  });
}
