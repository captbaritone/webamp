import { Metadata } from "next";
import SkinModel from "../../../../data/SkinModel";
import UserContext from "../../../../data/UserContext";

export async function generateSkinPageMetadata(
  hash: string
): Promise<Metadata> {
  const skin = await SkinModel.fromMd5Assert(new UserContext(), hash);
  const fileName = await skin.getFileName();
  const readme = await skin.getReadme();

  const imageUrl = `https://skin-museum-og-captbaritone-webamp.vercel.app/api/og?md5=${hash}`;

  const images = [
    {
      alt: `Screenshot of the Winamp skin ${fileName}.`,
      url: imageUrl,
      width: 1200,
      height: 600,
    },
  ];

  const title = `${fileName} - Winamp Skin Museum`;
  const description =
    readme == null
      ? `The Winamp Skin "${fileName}" in the Winamp Skin Museum. Explore skins, view details, and interact with previews.`
      : readme.slice(0, 300);
  return {
    title,
    description,
    alternates: {
      canonical: skin.getMuseumUrl(),
    },
    openGraph: {
      title,
      description,
      images,
      type: "website",
      siteName: "Winamp Skin Museum",
    },
    twitter: {
      card: "summary_large_image",
      site: "@winampskins",
      title,
      description,
      creator: "@captbaritone",
      images,
    },
  };
}
