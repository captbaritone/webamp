import { db, knex } from "../db";
import path from "path";
import logger from "../logger";
import { searchIndex } from "../algolia";
import { truncate } from "../utils";
import {
  DBSkinRecord,
  SkinRecord,
  DBIARecord,
  TweetStatus,
  NsfwPrediction,
} from "../types";
import fetch from "node-fetch";

const SKIN_TYPE = {
  CLASSIC: 1,
  MODERN: 2,
  PACK: 3,
  INVALID: 4,
};

const skins_DEPRECATED = db.get("skins");
const skins_CONVERTED = db.get("skins");
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

function getFilenames(skin: DBSkinRecord): string[] {
  return skin.filePaths.map((p) => path.basename(p));
}

function getCanonicalFilename(skin: DBSkinRecord): string | null {
  const fileNames = getFilenames(skin);
  return fileNames[0] || null;
}

function getSkinUrl(md5: string): string {
  return `https://cdn.webampskins.org/skins/${md5}.wsz`;
}
function getScreenshotUrl(md5: string): string {
  return `https://cdn.webampskins.org/screenshots/${md5}.png`;
}

function getWebampUrl(md5: string): string {
  return `https://webamp.org?skinUrl=${getSkinUrl(md5)}`;
}

function getMuseumUrl(md5: string): string {
  return `https://skins.webamp.org/skin/${md5}`;
}

export async function addSkin({
  md5,
  filePath,
  uploader,
  averageColor,
  modern,
}: {
  md5: string;
  filePath: string;
  uploader: string;
  averageColor?: string;
  modern: boolean;
}) {
  skins_CONVERTED.insert({
    md5,
    type: modern ? "MODERN" : "CLASSIC",
    filePaths: [filePath],
    uploader,
    averageColor,
  });
  await knex("skins").insert(
    {
      md5,
      skin_type: modern ? SKIN_TYPE.MODERN : SKIN_TYPE.CLASSIC,
      average_color: averageColor,
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
const MD5 = /([a-fA-F0-9]{32})/;

// TODO: SQLITE
export async function getMd5ByAnything(
  anything: string
): Promise<string | null> {
  const md5Match = anything.match(MD5);
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

export async function updateSearchIndex(md5: string): Promise<{} | null> {
  const skins = await knex.raw(
    `
    SELECT skins.md5, 
    skins.average_color, 
    skin_reviews.review = 'NSFW'     AS nsfw, 
    skins.readme_text,
  skins.emails,
    tweets.likes,
  files.file_path
FROM   skins 
    LEFT JOIN tweets 
           ON tweets.skin_md5 = skins.md5 
    LEFT JOIN skin_reviews 
           ON skin_reviews.skin_md5 = skins.md5
     LEFT JOIN files 
           ON files.skin_md5 = skins.md5 
WHERE  skin_type = 1 AND md5 = ? LIMIT 1;`,
    [md5]
  );

  const skin = skins[0] || null;
  if (skin == null) {
    console.log("No skin");
    return null;
  }

  const index = {
    objectID: skin.md5,
    md5: skin.md5,
    nsfw: skin.nsfw,
    readmeText: skin.readme_text ? truncate(skin.readme_text, 4800) : null,
    emails: skin.emails ? skin.emails.split() : [],
    color: skin.average_color,
    fileName: path.basename(skin.file_path),
    twitterLikes: Number(skin.likes || 0),
  };
  const results = await searchIndex.partialUpdateObjects([index], {
    createIfNotExists: true,
  });

  await recordSearchIndexUpdates(md5, Object.keys(index));

  return results;
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

export async function getSkinToTweet(): Promise<SkinRecord | null> {
  // TODO: This does not account for skins that have been both approved and rejected
  const tweetables = await knex("skins")
    .leftJoin("skin_reviews", "skin_reviews.skin_md5", "=", "skins.md5")
    .leftJoin("tweets", "tweets.skin_md5", "=", "skins.md5")
    .where({
      "tweets.id": null,
      skin_type: 1,
      "skin_reviews.review": "APPROVED",
    })
    .select("skins.md5")
    .orderByRaw("random()")
    .limit(1);
  const skin = tweetables[0];
  if (skin == null) {
    return null;
  }
  return getSkinByMd5_DEPRECATED(skin.md5);
}

export async function getStats(): Promise<{
  approved: number;
  rejected: number;
  tweeted: number;
  tweetable: number;
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
  const tweeted = (await knex("tweets").count("*", { as: "tweeted" }))[0]
    .tweeted;
  const tweetable = await getTweetableSkinCount();
  return { approved, rejected, tweeted: Number(tweeted), tweetable };
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
  tweetId: string
): Promise<void> {
  await skins_CONVERTED.findOneAndUpdate(
    { md5 },
    { $set: { twitterLikes: likes, tweetId } }
  );
  await knex("tweets")
    .where({ skin_md5: md5 })
    .update({ tweet_id: tweetId, likes }, []);
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
  const skins = await skins_DEPRECATED.find(
    { type: "CLASSIC" },
    {
      limit: first,
      skip: offset,
      sort: { twitterLikes: -1, approved: -1, rejected: 1 },
      fields: { averageColor: 1, md5: 1, nsfw: 1 },
    }
  );

  return skins.map(({ md5, average_color, nsfw }) => {
    return {
      color: average_color,
      filename: "FILENAME",
      md5,
      nsfw,
    };
  });
}

export async function getMuseumPageSql({
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
    skins.average_color, 
    skin_reviews.review = 'NSFW'     AS nsfw, 
    skin_reviews.review = 'APPROVED' AS approved, 
    skin_reviews.review = 'REJECTED' AS rejected, 
    tweets.likes,
  CASE skins.md5 
   WHEN "5e4f10275dcb1fb211d4a8b4f1bda236" THEN 0 -- Base
   WHEN "cd251187a5e6ff54ce938d26f1f2de02" THEN 1 -- Winamp3 Classified
   WHEN "b0fb83cc20af3abe264291bb17fb2a13" THEN 2 -- Winamp5 Classified
   WHEN "d6010aa35bed659bc1311820daa4b341" THEN 3 -- Bento Classified
   ELSE 1000
  END priority
FROM   skins 
    LEFT JOIN tweets 
           ON tweets.skin_md5 = skins.md5 
    LEFT JOIN skin_reviews 
           ON skin_reviews.skin_md5 = skins.md5 
WHERE  skin_type = 1 
ORDER  BY 
      priority ASC,
       tweets.likes DESC, 
       nsfw ASC, 
       approved DESC, 
       rejected ASC 
LIMIT ? offset ?`,
    [first, offset]
  );

  return skins.map(({ md5, nsfw, average_color }) => {
    return {
      color: undefined,
      filename: undefined,
      md5,
      nsfw: nsfw ? true : undefined,
    };
  });
}
