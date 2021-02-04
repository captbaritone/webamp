import { knex } from "../db";
import fetch from "node-fetch";
import UserContext from "../data/UserContext";
import SkinModel from "../data/SkinModel";
import child_process from "child_process";
import * as Parallel from "async-parallel";
import { chunk } from "../utils";
import util from "util";
const exec = util.promisify(child_process.exec);

function flatten<T>(matrix: T[][]): T[] {
  const flat: T[] = [];
  matrix.forEach((arr) => {
    flat.push(...arr);
  });
  return flat;
}

async function _filterOutKnownIdentifiers(
  identifiers: string[]
): Promise<string[]> {
  const found = await knex("ia_items")
    .whereIn("identifier", identifiers)
    .select(["identifier"]);
  const foundSet = new Set(found.map((row) => row.identifier));
  return identifiers.filter((id) => !foundSet.has(id));
}

async function filterOutKnownIdentifiers(
  identifiers: string[]
): Promise<string[]> {
  const matrix = await Parallel.map(
    chunk(identifiers, 800),
    (chunk) => _filterOutKnownIdentifiers(chunk),
    10
  );
  return flatten(matrix);
}

const CONCURRENT = 5;

// Build the URL to get all wsz files
function getSearchUrl(): string {
  const url = new URL("https://archive.org/advancedsearch.php");
  const queryString =
    "(collection:winampskins OR collection:winampskinsmature) skintype:wsz";
  url.searchParams.set("q", queryString);
  url.searchParams.append("fl[]", "identifier");
  url.searchParams.set("rows", "100000");
  url.searchParams.set("page", "1");
  url.searchParams.set("output", "json");
  return url.toString();
}

async function allItems(): Promise<string[]> {
  const r = await fetch(getSearchUrl());
  const result = await r.json();
  const response = result.response;
  const numFound = response.numFound;
  const items = response.docs;
  if (items.length !== numFound) {
    console.error(`Expected to find ${numFound} items but saw ${items.length}`);
  }
  if (items.length === 100000) {
    console.error(
      `We've hit the max number of items. We are likely missing some.`
    );
  }
  return items.map((item: { identifier: string }) => item.identifier);
}

async function ensureIaRecord(
  ctx: UserContext,
  identifier: string
): Promise<void> {
  const r = await fetch(`https://archive.org/metadata/${identifier}`);
  const response = await r.json();
  const files = response.files;
  const skins = files.filter((file) => file.name.endsWith(".wsz"));
  if (skins.length === 0) {
    // TODO TODO TODO TODO
    // TODO TODO TODO TODO
    //
    // What if the skin ends in .zip?
    //
    // TODO TODO TODO TODO
    // TODO TODO TODO TODO
    console.log(`No skins found in ${identifier}. Deleting... (YOLO)`);
    const command = `ia delete ${identifier} --all`;
    // await exec(command, { encoding: "utf8" });
    console.log(`Deleted ${identifier}`);
    return;
  }
  if (skins.length !== 1) {
    console.error(
      `Expected to find one skin file for "${identifier}", found ${skins.length}`
    );
    return;
  }
  const md5 = skins[0].md5;
  const skin = await SkinModel.fromMd5(ctx, md5);
  if (skin == null) {
    console.error(
      `We don't have a record for the skin found in "${identifier}"`
    );
    return;
  }

  await knex("ia_items").insert({ skin_md5: md5, identifier });
  console.log(`Inserted "${identifier}".`);
}

export async function syncFromArchive() {
  const ctx = new UserContext();
  // Ensure we know about all items in the `winampskins` collection.
  console.log("Going to ensure we know about all archive items");
  const items = await allItems();
  const unknownItems = await filterOutKnownIdentifiers(items);
  await Parallel.each(
    unknownItems,
    async (identifier) => {
      await ensureIaRecord(ctx, identifier);
    },
    CONCURRENT
  );
}
