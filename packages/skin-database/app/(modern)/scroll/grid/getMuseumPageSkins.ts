"use server";

import { getMuseumPage, getScreenshotUrl } from "../../../../data/skins";

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
    fileName: item.fileName,
    nsfw: item.nsfw,
  }));

  return skins;
}
