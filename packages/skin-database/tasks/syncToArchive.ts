import { knex } from "../db";
import path from "path";
import fetch from "node-fetch";
import _temp from "temp";
import fs from "fs";
import UserContext from "../data/UserContext";
import SkinModel from "../data/SkinModel";
import * as Parallel from "async-parallel";
import IaItemModel from "../data/IaItemModel";
import DiscordEventHandler from "../api/DiscordEventHandler";
import { exec } from "../utils";
import * as IAService from "../services/internetArchive";

export async function findItemsMissingImages(): Promise<string[]> {
  const ctx = new UserContext();
  const results = await knex.raw("SELECT * FROM ia_items;");

  const md5s: string[] = [];

  for (const row of results) {
    const iaItem = new IaItemModel(ctx, row);
    if (iaItem == null) {
      throw new Error("Expected to find IA item");
    }
    if (iaItem.getSkinFiles().length > 1) {
      console.warn("Too many skin files", row.skin_md5, row.identifier);
      continue;
    }
    if (iaItem.getSkinFiles().length < 1) {
      console.log(iaItem.getAllFiles());
      console.warn("Missing skin file", row.skin_md5, row.identifier);
      continue;
    }
    if (iaItem.getUploadedFiles().length >= 2) {
      continue;
    }

    md5s.push(iaItem.getMd5());
  }

  return md5s;
}

// Uploads the screenshot to IA if it's safe to do so. In general this should
// not be needed, since we usually upload both files at once.
export async function uploadScreenshotIfSafe(md5: string): Promise<boolean> {
  const ctx = new UserContext();
  const skin = await SkinModel.fromMd5Assert(ctx, md5);
  const iaItem = await skin.getIaItem();
  if (iaItem == null) {
    throw new Error("Expected ia item to exist");
  }
  if (!iaItem.row.metadata) {
    console.warn("No metadata found for row");
    return false;
  }
  if (await iaItem.hasRunningTasks()) {
    console.warn("Has running tasks");
    return false;
  }
  const skinFiles = iaItem.getSkinFiles();
  if (skinFiles.length != 1) {
    console.warn(`Has ${skinFiles.length} skins`);
    return false;
  }
  const uploadedFiles = iaItem.getUploadedFiles();
  if (uploadedFiles.length !== skinFiles.length) {
    console.warn(
      `Has ${skinFiles.length} skins and ${uploadedFiles.length} uploaded files.`
    );
    return false;
  }

  await skin.withScreenshotTempFile(async (screenshotFile) => {
    await IAService.uploadFile(iaItem.getIdentifier(), screenshotFile);
  });
  await iaItem.invalidateMetadata();
  return true;
}

export async function updateMissingMetadata(
  ctx: UserContext,
  count: number
): Promise<void> {
  const results = await knex("ia_items").limit(count).select();

  for (const row of results) {
    const _iaItem = new IaItemModel(ctx, row);
    throw new Error("Not implemented yet");
  }
  //
}

export async function updateMetadata(skin: SkinModel): Promise<void> {
  if (skin.getSkinType() !== "CLASSIC") {
    throw new Error("Only classic skins can be updated");
  }

  const filename = await skin.getFileName();

  const title = `Winamp Skin: ${filename}`;

  const metadata: { [key: string]: string } = {
    title,
    skintype: "wsz",
    mediatype: "software",
    museum: skin.getMuseumUrl(),
  };

  if (await skin.getIsNsfw()) {
    metadata.review = "NSFW";
  }

  const iaItem = await skin.getIaItem();
  if (iaItem == null) {
    throw new Error("Expected IA item to exist");
  }

  await IAService.setMetadata(iaItem.getIdentifier(), metadata);
  await iaItem.invalidateMetadata();
}

/** LEGACY BELOW HERE */

const CONCURRENT = 1;

const temp = _temp.track();

function sanitize(name: string): string {
  return name.replace(/[^A-Za-z0-9_\-.]/g, "_").replace(/^\d*/, "");
}

async function downloadToTemp(url: string, filename: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download from ${filename} from ${url}`);
  }
  const result = await response.buffer();
  const tempDir = temp.mkdirSync();
  const tempFile = path.join(tempDir, filename);
  fs.writeFileSync(tempFile, result);
  return tempFile;
}

// For some unknown reason IA rejects these.
const INVALID_IDENTIFIERS = new Set([
  "winampskins_DIGITOOL",
  "winampskins_hell_2",
  "winampskins_Tribute_to_Tupac_Shakur",
  "winampskins_DARK",
  "winampskins_DarK",
  "winampskins_dark",
  "winampskins_Sakura",
  "winampskins_Sakura3",
  "winampskins_Izumi2",
]);

export async function identifierExists(identifier: string): Promise<boolean> {
  if (INVALID_IDENTIFIERS.has(identifier)) {
    return true;
  }
  const existing = await knex("ia_items")
    .whereRaw("LOWER(identifier) = LOWER(?)", identifier)
    .select([]);
  if (existing.length > 0) {
    return true;
  }
  return IAService.identifierExists(identifier);
}

async function getNewIdentifier(filename: string): Promise<string> {
  // The internet archvie has a max identifier length of 80 chars.
  const identifierBase = `winampskins_${sanitize(
    path.parse(filename).name
  )}`.slice(0, 76);
  let counter = 0;
  function getIdentifier() {
    return identifierBase + (counter === 0 ? "" : `_${counter}`);
  }
  while (await identifierExists(getIdentifier())) {
    counter++;
  }
  return getIdentifier();
}

export async function archive(skin: SkinModel): Promise<string> {
  const filename = await skin.getFileName();

  const screenshotFilename = await skin.getScreenshotFileName();
  const title = `Winamp Skin: ${filename}`;

  const [skinFile, screenshotFile] = await Promise.all([
    downloadToTemp(skin.getSkinUrl(), filename),
    downloadToTemp(skin.getScreenshotUrl(), screenshotFilename),
  ]);

  // Pick identifier
  const identifier = await getNewIdentifier(filename);

  console.log(`Going to try to upload with identifier "${identifier}"...`);

  const command = `ia upload ${identifier} "${skinFile}" "${screenshotFile}" --metadata="collection:winampskins" --metadata="skintype:wsz" --metadata="mediatype:software" --metadata="title:${title}"`;
  await exec(command, { encoding: "utf8" });
  await knex("ia_items").insert({ skin_md5: skin.getMd5(), identifier });
  return identifier;
}

export async function syncToArchive(handler: DiscordEventHandler) {
  const ctx = new UserContext();
  console.log("Checking which new skins we have...");
  const unarchived = await knex("skins")
    .leftJoin("ia_items", "ia_items.skin_md5", "=", "skins.md5")
    .where({ "ia_items.id": null, skin_type: 1 })
    .limit(100)
    .select("skins.md5");

  handler.handle({ type: "STARTED_SYNC_TO_ARCHIVE", count: unarchived.length });

  let successCount = 0;
  let errorCount = 0;

  await Parallel.map(
    unarchived,
    async ({ md5 }) => {
      const skin = await SkinModel.fromMd5Assert(ctx, md5);
      try {
        console.log(`Attempting to upload ${md5}`);
        const identifier = await archive(skin);
        console.log(`SUCCESS! Uplaoded ${md5} as ${identifier}`);
        successCount++;
      } catch (e) {
        console.log("Archive failed...");
        errorCount++;
        // The internet archive claims this one is corrupt for some reason.
        if (md5 === "513fdd06bf39391e52f3ac5b233dd147") {
          console.warn(`This skin is known to not upload correctly.`);
        }
        if (/error checking archive/.test(e.message)) {
          console.log(`Corrupt archvie: ${skin.getMd5()}`);
        } else if (
          /archive files are not allowed to contain encrypted content/.test(
            e.message
          )
        ) {
          console.log(`Corrupt archvie (encrypted): ${skin.getMd5()}`);
        } else if (/case alias may already exist/.test(e.message)) {
          console.log(
            `Invalid name (case alias): ${skin.getMd5()} with ${e.message}`
          );
        } else {
          console.error(e);
        }
      }
    },
    CONCURRENT
  );
  await handler.handle({
    type: "SYNCED_TO_ARCHIVE",
    successes: successCount,
    errors: errorCount,
  });
  console.log(`Job complete: ${successCount} success, ${errorCount} errors`);
}
// Build the URL to get all wsz files
function getSearchUrl(): string {
  const url = new URL("https://archive.org/advancedsearch.php");
  // https://stackoverflow.com/a/11890368/1263117
  const queryString =
    "(collection:winampskins OR collection:winampskinsmature) skintype:wsz -webamp:[* TO *]";
  url.searchParams.set("q", queryString);
  url.searchParams.append("fl[]", "identifier");
  url.searchParams.append("fl[]", "webamp");
  url.searchParams.set("rows", "100000");
  url.searchParams.set("page", "1");
  url.searchParams.set("output", "json");
  return url.toString();
}

export async function ensureWebampLinks() {
  const ctx = new UserContext();
  const r = await fetch(getSearchUrl());
  const result = await r.json();
  const response = result.response;
  const items: { identifier: string }[] = response.docs;
  await Parallel.each(
    items,
    async ({ identifier }) => {
      const iaItem = await IaItemModel.fromIdentifier(ctx, identifier);
      if (iaItem == null) {
        console.log(`Found an IA item we are missing: "${identifier}`);
        return;
      }
      const r = await fetch(`https://archive.org/metadata/${identifier}`);
      const response = await r.json();
      const files = response.files;
      const skins = files.filter((file) => file.name.endsWith(".wsz"));
      if (skins.length === 0) {
        console.warn(`Could not find any skin file for ${identifier}`);
        return;
      }
      if (skins.length > 1) {
        console.warn(`Too many skin files for ${identifier}`);
        return;
      }

      const skin = skins[0];
      if (skin.md5 !== iaItem.getMd5()) {
        console.error(`Md5 mismatch for ${identifier}`);
        return;
      }
      const skinUrl = `https://archive.org/cors/${identifier}/${encodeURIComponent(
        skin.name
      )}`;

      const webampLink = new URL("https://webamp.org");
      webampLink.searchParams.set("skinUrl", skinUrl);
      console.log(webampLink.toString());
    },
    5
  );
}
