"use server";

import {
  getMuseumPage,
  getRandomMuseumPage,
  type MuseumPage,
} from "../../../data/skins";
import UserContext from "../../../data/UserContext";
import { search_classic_skins } from "../../../api/graphql/resolvers/SkinResolver";
import { GridSkin, SkinDetails, toGridSkin } from "./gridSkin";
import { isRandomPlace, museumPosition } from "./museumList";
import { getLinkedSkin, getSkinDetailsFor, isLinkableSkin } from "./feedSkins";

const MAX_PAGE_SIZE = 100;
// Random picks a page gets more of than it needs, in case some are on it
// already.
const EXTRA_RANDOM_SKINS = 5;

/**
 * Places `offset` to `offset + limit` of the museum list: the museum's skins,
 * with random ones in the places for them (see museumList.ts). Picked anew
 * for each request; the client keeps each page it gets for the visit.
 */
export async function getMuseumPageSkins(
  offset: number,
  limit: number
): Promise<GridSkin[]> {
  if (
    !Number.isInteger(offset) ||
    offset < 0 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_PAGE_SIZE
  ) {
    throw new Error("Invalid request");
  }
  const places = Array.from({ length: limit }, (_, i) => offset + i);
  const museumPlaces = places.filter((place) => !isRandomPlace(place));
  const randomCount = limit - museumPlaces.length;
  const [museumSkins, randomSkins] = await Promise.all<MuseumPage>([
    museumPlaces.length === 0
      ? []
      : getMuseumPage({
          offset: museumPosition(museumPlaces[0]),
          first: museumPlaces.length,
        }),
    randomCount === 0
      ? []
      : getRandomMuseumPage(randomCount + EXTRA_RANDOM_SKINS),
  ]);
  const onPage = new Set(museumSkins.map((skin) => skin.md5));
  const randoms = randomSkins.filter(
    (skin) => !onPage.has(skin.md5) && onPage.add(skin.md5)
  );
  const page: GridSkin[] = [];
  let nextMuseum = 0;
  let nextRandom = 0;
  for (const place of places) {
    const random = isRandomPlace(place);
    const skin = random ? randoms[nextRandom++] : museumSkins[nextMuseum++];
    // The end of the museum (or, very rarely, too few random picks).
    if (skin == null) break;
    const gridSkin = toGridSkin(skin.md5, skin.fileName, skin.nsfw);
    page.push(random ? { ...gridSkin, random: true } : gridSkin);
  }
  return page;
}

/**
 * The grid's search, for a page loaded with one in its URL, so it can start
 * with the results. Always our SQLite FTS search (graphqlSearch's backend),
 * even when the browser searches Algolia, so crawlers and link previews don't
 * spend Algolia quota. Results can differ a little from Algolia's.
 */
export async function getSearchSkins(query: string): Promise<GridSkin[]> {
  const results = await search_classic_skins(
    query,
    500,
    0,
    null,
    new UserContext()
  );
  return Promise.all(
    results
      .filter((skin) => skin != null)
      .map(async (skin) => {
        const [fileName, nsfw] = await Promise.all([
          skin.filename(true),
          skin.nsfw(),
        ]);
        return toGridSkin(skin.md5(), fileName, nsfw);
      })
  );
}

const MAX_DETAILS_PER_REQUEST = 20;
const MD5 = /^[0-9a-f]{32}$/;

/**
 * The skin a feed page is for, or null if there's no such classic skin.
 *
 * The feed's page calls this rather than feedSkins.ts directly: its client
 * code calls this module's actions, and importing them from the page too lets
 * the build share one copy of everything they use, rather than two.
 */
export async function getFeedSkin(
  md5: string
): Promise<{ skin: GridSkin; details: SkinDetails } | null> {
  if (typeof md5 !== "string" || !MD5.test(md5)) return null;
  return getLinkedSkin(md5);
}

/** Whether there's a feed page for this md5 (see skin/[md5]/layout.tsx). */
export async function feedSkinExists(md5: string): Promise<boolean> {
  return typeof md5 === "string" && MD5.test(md5) && isLinkableSkin(md5);
}

/** The feed's details for these skins, for the ones that exist. */
export async function getSkinDetails(
  md5s: string[]
): Promise<Record<string, SkinDetails>> {
  // Anyone can call a server action, so take only what the feed would send.
  if (
    !Array.isArray(md5s) ||
    md5s.length > MAX_DETAILS_PER_REQUEST ||
    !md5s.every((md5) => typeof md5 === "string" && MD5.test(md5))
  ) {
    throw new Error("Invalid request");
  }
  return getSkinDetailsFor(md5s);
}
