"use server";

import { getMuseumPage } from "../../../data/skins";
import UserContext from "../../../data/UserContext";
import { search_classic_skins } from "../../../api/graphql/resolvers/SkinResolver";
import { GridSkin, SkinDetails, toGridSkin } from "./gridSkin";
import { getLinkedSkin, getSkinDetailsFor, isLinkableSkin } from "./feedSkins";

export async function getMuseumPageSkins(
  offset: number,
  limit: number
): Promise<GridSkin[]> {
  const page = await getMuseumPage({ offset, first: limit });
  return page.map((item) => toGridSkin(item.md5, item.fileName, item.nsfw));
}

/**
 * The grid's search, for a page loaded with one in its URL, so it can start
 * with the results. The same search the grid runs in the browser
 * (graphqlSearch), with the same number of results.
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
