import { knex } from "../db";
import { TWEET_SNOWFLAKE_REGEX } from "../utils";

function isNotGeneratedFile(file) {
  switch (file.source) {
    case "derivative":
    case "metadata":
      return false;
  }
  switch (file.format) {
    case "Metadata":
    case "Item Tile":
    case "JPEG Thumb":
      return false;
  }
  return true;
}

export async function checkInternetArchiveMetadata(): Promise<void> {
  const results = await knex.raw(
    'SELECT skin_md5, identifier, metadata FROM ia_items WHERE metadata != "";'
  );

  const tooMany: string[] = [];
  const tooFew: string[] = [];
  const missingSkin: string[] = [];

  for (const item of results) {
    const { identifier, metadata, skin_md5 } = item;
    try {
      const allFiles = JSON.parse(metadata).files;
      const files = allFiles.filter(isNotGeneratedFile);
      if (files.length > 2) {
        tooMany.push(skin_md5);
        continue;
        console.warn("Too many files", { files, identifier, skin_md5 });
      }
      const skinFile = files.find((file) => file.md5 === skin_md5);
      if (skinFile == null) {
        missingSkin.push(skin_md5);
        continue;
        console.warn("No skin file", { identifier, skin_md5 });
      }
      if (files.length < 2) {
        console.log({ skin_md5, identifier, length: files.length });
        tooFew.push(skin_md5);
        continue;
        console.warn("Too few files", { identifier, skin_md5 });
      }
    } catch (e) {
      console.log(metadata);
    }
  }

  console.table({
    total: results.length,
    tooMany: tooMany.length,
    tooFew: tooFew.length,
    missingSkin: missingSkin.length,
  });
}

export async function integrityCheck(): Promise<void> {
  await noDuplicateTweetIds();
  await noDuplicateTweetMd5s();

  await skinsWithoutFiles();
  await filesWithoutSkins();
  await reviewsWithoutSkins();
  await tweetsHaveIdIfTheyHaveURl();
  // There are still some
  // await noDuplicateIaItems();

  // There are still some
  // await tweetsHaveIds();

  // Not needed regularly
  // await findHashesForTweets();
  console.log("Done.");
}

async function skinsWithoutFiles(): Promise<void> {
  console.log("Checking for skins without files...");
  const result = await knex("skins")
    .leftJoin("files", "skins.md5", "=", "files.skin_md5")
    .where("files.skin_md5", null)
    .select(["md5"]);
  if (result.length > 0) {
    console.warn(`Found ${result.length} skins without files`);
  } else {
    console.log("None found.");
  }
}

async function filesWithoutSkins(): Promise<void> {
  console.log("Checking for files without skins...");
  const result = await knex("files")
    .leftJoin("skins", "skins.md5", "=", "files.skin_md5")
    .where("skins.md5", null)
    .select(["files.skin_md5"]);
  if (result.length > 0) {
    console.warn(`Found ${result.length} files without skins`);
  } else {
    console.log("None found.");
  }
}

async function reviewsWithoutSkins(): Promise<void> {
  console.log("Checking for reviews without skins...");
  const result = await knex("skin_reviews")
    .leftJoin("skins", "skins.md5", "=", "skin_reviews.skin_md5")
    .where("skins.md5", null)
    .select(["skin_reviews.skin_md5"]);
  if (result.length > 0) {
    console.warn(`Found ${result.length} reviews without skins`);
  } else {
    console.log("None found.");
  }
}

async function noDuplicateTweetIds(): Promise<void> {
  console.log("Checking for duplicate Tweet ids...");
  const result = await knex.raw(
    "SELECT tweet_id, COUNT(*) c FROM tweets GROUP BY tweet_id HAVING c > 1;"
  );
  if (result.length > 0) {
    console.warn(`Found ${result.length} tweets with duplicate tweet_id.`);
  } else {
    console.log("None found.");
  }
}

async function noDuplicateTweetMd5s(): Promise<void> {
  console.log("Checking for duplicate Tweet md5s...");
  const result = await knex.raw(
    "SELECT skin_md5, COUNT(*) c FROM tweets GROUP BY skin_md5 HAVING c > 1;"
  );
  if (result.length > 0) {
    console.warn(`Found ${result.length} tweets with duplicate skin_md5.`);
  } else {
    console.log("None found.");
  }
}

async function tweetsHaveIdIfTheyHaveURl(): Promise<void> {
  console.log("Checking for Tweets with URLs but no ids...");
  const results = await knex.raw(
    "SELECT * FROM tweets WHERE tweet_id IS NULL AND url IS NOT NULL;"
  );
  if (results.length > 0) {
    for (const row of results) {
      const { id, url } = row;
      const idMatch = url.match(TWEET_SNOWFLAKE_REGEX);
      if (idMatch == null) {
        throw new Error(`Can't extract id from tweet URL: ${url}`);
      }
      await knex("tweets").where({ id }).update({ tweet_id: idMatch[0] }, []);
      console.log(`Updated tweet with url ${url}`);
    }
  } else {
    console.log("None found.");
  }
}
