import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeedSkin } from "../../getMuseumPageSkins";
import SkinScroller from "../../SkinScroller";
import { generateSkinPageMetadata } from "../../../../(legacy)/skin/[hash]/skinMetadata";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { md5 } = await params;
  return generateSkinPageMetadata(md5);
}

// Likes and readmes change; render each visit fresh.
export const dynamic = "force-dynamic";

/**
 * A skin's permalink: the feed, opened on it. Which skins come after it is
 * up to the browser (see listPosition.ts), so all we render is this one.
 */
export default async function Skin({ params }) {
  const { md5 } = await params;
  const linked = await getFeedSkin(md5);
  if (linked == null) notFound();
  return <SkinScroller skin={linked.skin} details={linked.details} />;
}
