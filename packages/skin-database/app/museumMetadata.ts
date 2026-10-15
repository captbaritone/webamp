import type { Metadata } from "next";

const DESCRIPTION =
  "Infinite scroll through 100k Winamp skins with interactive preview";

/**
 * Metadata for the museum's home page (the skin grid), including a search's
 * results (`?query=`). Shared by the classic and new UIs.
 */
export function museumMetadata(query: string | undefined): Metadata {
  if (query) {
    const images = [
      {
        alt: `Screenshot of Winamp skins matching "${query}"`,
        url: `https://skin-museum-og-captbaritone-webamp.vercel.app/api/og?query=${encodeURIComponent(
          query
        )}`,
        width: 1200,
        height: 600,
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
      width: 1200,
      height: 600,
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
