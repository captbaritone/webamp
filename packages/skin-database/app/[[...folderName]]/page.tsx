import App from "../../../skin-museum-client/src/App";
import type { Metadata } from "next";

const DESCRIPTION =
  "Infinite scroll through 100k Winamp skins with interactive preview";

export const dynamic = "force-dynamic"; // Force this page to always be server-rendered

export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const { query } = await searchParams;
  if (query) {
    const images = [
      {
        alt: `Screenshot of Winamp skins matching "${query}"`,
        url: `https://skin-museum-og-captbaritone-webamp.vercel.app/api/og?query=${encodeURIComponent(
          query
        )}`,
        width: "1844",
        height: "1297",
      },
    ];
    const title = `Winamp Skin Museum - Search Results for "${query}"`;
    const description = `Search results for "${query}" in the Winamp Skin Museum. Explore skins, view details, and interact with previews.`;
    return {
      title,
      description,
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
        title: "Skin Museum",
        description,
        creator: "@captbaritone",
        images,
      },
    };
  }

  const images = [
    {
      alt: "Screenshot of many Winamp skins in a grid.",
      url: "https://skin-museum-og-captbaritone-webamp.vercel.app/api/og",
      width: "1844",
      height: "1297",
    },
  ];
  const title = "Winamp Skin Museum";
  return {
    title,
    description: DESCRIPTION,
    openGraph: {
      title,
      description: DESCRIPTION,
      images,
      type: "website",
      siteName: "Winamp Skin Museum",
    },
    twitter: {
      card: "summary_large_image",
      site: "@winampskins",
      title,
      description: DESCRIPTION,
      creator: "@captbaritone",
      images,
    },
  };
}

export default function Page() {
  return <App next={true} />;
}
