import App from "../../../skin-museum-client/src/App";
import type { Metadata } from "next";

const DESCRIPTION =
  "Infinite scroll through 80k Winamp skins with interactive preview";

export function generateMetadata(): Metadata {
  const images = [
    {
      alt: "Screenshot of many Winamp skins in a grid.",
      url: "https://skin-museum-og-captbaritone-webamp.vercel.app/api/og",
      width: "1844",
      height: "1297",
    },
  ];
  return {
    title: "Winamp Skin Museum",
    description: DESCRIPTION,
    openGraph: {
      title: "Skin Museum",
      description: DESCRIPTION,
      images,
      type: "website",
      siteName: "Winamp Skin Museum",
    },
    twitter: {
      card: "summary_large_image",
      site: "@winampskins",
      title: "Skin Museum",
      description: DESCRIPTION,
      creator: "@captbaritone",
      images,
    },
  };
}

export default function Page() {
  return <App next={true} />;
}
