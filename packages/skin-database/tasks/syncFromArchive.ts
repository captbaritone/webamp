import { knex } from "../db";
import fetch from "node-fetch";
import UserContext from "../data/UserContext";
import * as Parallel from "async-parallel";
import { chunk, flatten } from "../utils";
import IaItemModel from "../data/IaItemModel";

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

export async function fillMissingMetadata(count: number) {
  const ctx = new UserContext();
  const skins = await knex("ia_items")
    .where((builder) => {
      builder.where("ia_items.metadata", null).orWhere("ia_items.metadata", "");
    })
    .whereNot("ia_items.identifier", null)
    .select("ia_items.skin_md5", "ia_items.identifier");
  console.log(`Found ${skins.length} items to fetch metadata for`);

  const items = skins.slice(0, count);

  for (const { skin_md5, identifier } of items) {
    const iaItem = await IaItemModel.fromIdentifier(ctx, identifier);
    if (iaItem == null) {
      console.error(`Could not find IA item for ${identifier}`);
      break;
    }
    await iaItem.updateMetadata();
    console.log(`Updated metadata for ${identifier} ${skin_md5}`);
  }
  console.log("Done updating metadata.");
}

export async function syncFromArchive() {
  throw new Error("This needs to be rewritten");
  const ctx = new UserContext();
  // Ensure we know about all items in the `winampskins` collection.
  console.log("Going to ensure we know about all archive items");
  const items = await allItems();
  const unknownItems = await filterOutKnownIdentifiers(items);
  await Parallel.each(
    unknownItems,
    async (identifier) => {
      console.log(identifier, ctx);
      // await ensureIaRecord(ctx, identifier);
    },
    CONCURRENT
  );
}
