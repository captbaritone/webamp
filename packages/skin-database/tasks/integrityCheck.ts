import { knex } from "../db";

export async function integrityCheck(): Promise<void> {
  await skinsWithoutFiles();
  await filesWithoutSkins();
  await reviewsWithoutSkins();
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
