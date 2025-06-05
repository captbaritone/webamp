import type { MetadataRoute } from "next";
import * as Skins from "../data/skins";

// Google's limit is 50,000 URLs per sitemap
const PAGE_SIZE = 50000;

const BASE_URL = "https://skins.webamp.org";

export const dynamic = "force-dynamic"; // This ensures the sitemap is always generated fresh

export async function generateSitemaps(): Promise<{ id: string }[]> {
  const count = await Skins.getClassicSkinCount();
  const maps: { id: string }[] = [];
  for (let i = 0; i < Math.ceil(count / PAGE_SIZE); i++) {
    maps.push({ id: String(i) });
  }
  return maps;
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const md5s = await Skins.getAllClassicSkins();
  const skinUrls = md5s.map(
    ({ md5, fileName }) => `/skin/${md5}/${encodeURIComponent(fileName)}`
  );
  const urls = ["/about", "/", "/upload", ...skinUrls];
  const slice = urls.slice(
    parseInt(id, 10) * PAGE_SIZE,
    (parseInt(id, 10) + 1) * PAGE_SIZE
  );
  return slice.map((url) => ({
    url: `${BASE_URL}${url}`,
    changeFrequency: "monthly",
  }));
}
