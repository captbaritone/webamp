"use server";

import { getMuseumPage, getScreenshotUrl } from "../../../data/skins";
import UserContext from "../../../data/UserContext";
import { search_classic_skins } from "../../../api/graphql/resolvers/SkinResolver";
import { normalizeSkinFileName } from "./skinFileName";

export type GridSkin = {
  md5: string;
  screenshotUrl: string;
  fileName: string;
  nsfw: boolean;
};

export async function getMuseumPageSkins(
  offset: number,
  limit: number
): Promise<GridSkin[]> {
  const page = await getMuseumPage({ offset, first: limit });

  const skins = page.map((item) => ({
    md5: item.md5,
    screenshotUrl: getScreenshotUrl(item.md5),
    fileName: normalizeSkinFileName(item.fileName),
    nsfw: item.nsfw,
  }));

  return skins;
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
    results.flatMap((skin) =>
      skin == null
        ? []
        : [
            (async () => ({
              md5: skin.md5(),
              screenshotUrl: getScreenshotUrl(skin.md5()),
              fileName: normalizeSkinFileName(await skin.filename(true)),
              nsfw: await skin.nsfw(),
            }))(),
          ]
    )
  );
}
