import { knex } from "../db";
import path from "path";
import fetch from "node-fetch";
import _temp from "temp";
import fs from "fs";
import child_process from "child_process";
import UserContext from "../data/UserContext";
import SkinModel from "../data/SkinModel";
const temp = _temp.track();

async function allItems(): Promise<string[]> {
  const r = await fetch(
    "https://archive.org/advancedsearch.php?q=collection%3Awinampskins+skintype%3Awsz&fl%5B%5D=identifier&fl%5B%5D=skintype&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=100000&page=1&output=json&save=yes"
  );
  const result = await r.json();
  const response = result.response;
  const numFound = response.numFound;
  const items = response.docs;
  if (items.length !== numFound) {
    console.error(`Expected to find ${numFound} items but saw ${items.length}`);
  }
  items.forEach((item) => {
    if (item.skintype !== "wsz") {
      throw new Error(`${item.identifier} has skintype of ${item.skintype}`);
    }
  });
  return items.map((item: { identifier: string }) => item.identifier);
}

async function ensureIaRecord(identifier: string): Promise<void> {
  const dbItem = await knex("ia_items").where({ identifier }).first();
  if (dbItem) {
    return;
  }
  const r = await fetch(`https://archive.org/metadata/${identifier}`);
  const response = await r.json();
  const files = response.files;
  const skins = files.filter((file) => file.name.endsWith(".wsz"));
  if (skins.length !== 1) {
    console.error(
      `Expected to find one skin file for "${identifier}", found ${skins.length}`
    );
    return;
  }
  const md5 = skins[0].md5;
  const skin = await knex("skins").where({ md5 }).first();
  if (skin == null) {
    console.error(
      `We don't have a record for the skin found in "${identifier}"`
    );
    return;
  }

  await knex("ia_items").insert({ skin_md5: md5, identifier });
  console.log(`Inserted "${identifier}".`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function collectExistingItems() {
  const items = await allItems();
  for (const identifier of items) {
    await ensureIaRecord(identifier);
  }
}

function sanitize(name: string): string {
  return name.replace(/[^A-Za-z0-9_\-.]/g, "_").replace(/^\d*/, "");
}

async function downloadToTemp(url: string, filename: string): Promise<string> {
  const response = await fetch(url);
  const result = await response.buffer();
  const tempDir = temp.mkdirSync();
  const tempFile = path.join(tempDir, filename);
  fs.writeFileSync(tempFile, result);
  return tempFile;
}

async function getNewIdentifier(filename: string): Promise<string> {
  const identifierBase = `winampskins_${sanitize(path.parse(filename).name)}`;
  let counter = 0;
  function getIdentifier() {
    return identifierBase + (counter === 0 ? "" : `_${counter}`);
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await knex("ia_items").whereRaw(
      "LOWER(identifier) = LOWER(?)",
      getIdentifier()
    );
    if (existing.length === 0) {
      break;
    }
    counter++;
  }
  return getIdentifier();
}

async function archive(md5: string): Promise<string> {
  const ctx = new UserContext();
  const skin = await SkinModel.fromMd5(ctx, md5);
  if (skin == null) {
    throw new Error(`Could not find skin with hash ${md5}`);
  }

  const filename = await skin.getFileName();
  if (filename == null) {
    throw new Error(`Could archive skin. Filename not found. ${md5}`);
  }

  if (!(filename.endsWith(".wsz") || filename.endsWith(".zip"))) {
    throw new Error(`Unexpected file extension for ${md5}: ${filename}`);
  }

  const screenshotFilename = filename.replace(/\.(wsz|zip)$/, ".png");
  const title = `Winamp Skin: ${filename}`;

  const [skinFile, screenshotFile] = await Promise.all([
    downloadToTemp(skin.getSkinUrl(), filename),
    downloadToTemp(skin.getScreenshotUrl(), screenshotFilename),
  ]);

  // Pick identifier
  const identifier = await getNewIdentifier(filename);

  const command = `ia upload ${identifier} "${skinFile}" "${screenshotFile}" --metadata="collection:winampskins" --metadata="skintype:wsz" --metadata="mediatype:software" --metadata="title:${title}"`;
  child_process.execSync(command, { encoding: "utf8" });
  await knex("ia_items").insert({ skin_md5: md5, identifier });
  return identifier;
}

const CORRUPT = new Set([
  "2e146de10eef96773ea222fefad52eeb",
  "c3d2836f7f1b91d87d60b93aadf6981a",
  "4288c254d9a22024c48601db5f9812e9",
  "042271e3aea64970a885a8ab1cfe4a3f",
]);
async function main() {
  // Ensure we know about all items in the `winampskins` collection.
  // await collectExistingItems();
  const unarchived = await knex("skins")
    .leftJoin("ia_items", "ia_items.skin_md5", "=", "skins.md5")
    .where({ "ia_items.id": null, skin_type: 1 })
    .select("skins.md5");

  console.log(`Found ${unarchived.length} skins to upload`);

  for (const skin of unarchived) {
    console.log(skin.md5);
    if (CORRUPT.has(skin.md5)) {
      console.log("Skipping corrupt archive");
      continue;
    }
    try {
      const identifier = await archive(skin.md5);
      console.log(identifier);
    } catch (e) {
      console.log("Archive failed...");
      console.error(e);
    }
  }
}

async function m() {
  try {
    await main();
  } finally {
    knex.destroy();
  }
}

m();
