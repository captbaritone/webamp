import App from "../../../../skin-museum-client/src/App";
import type { Metadata } from "next";
import SkinModel from "../../../data/SkinModel";
import UserContext from "../../../data/UserContext";

const DESCRIPTION =
  "Infinite scroll through 80k Winamp skins with interactive preview";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { segments } = await params;
  const [hash, _fileName] = segments;

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
  const description = readme || DESCRIPTION;
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

export default function Page() {
  return <App next={true} />;
}
