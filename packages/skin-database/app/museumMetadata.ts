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
        url: `https://skins.webamp.org/og/search.jpg?query=${encodeURIComponent(
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
      url: "https://skins.webamp.org/og/museum.jpg",
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

/**
 * Metadata for one of the museum's other pages (About, Feedback), shared by
 * the classic and new UIs. Previews with the museum's image.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = `${title} - Winamp Skin Museum`;
  const url = `https://skins.webamp.org${path}`;
  const images = [
    {
      alt: "Screenshot of many Winamp skins in a grid.",
      url: "https://skins.webamp.org/og/museum.jpg",
      width: 1200,
      height: 600,
    },
  ];
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      images,
      type: "website",
      siteName: "Winamp Skin Museum",
    },
    twitter: {
      card: "summary_large_image",
      site: "@winampskins",
      title: fullTitle,
      description,
      creator: "@captbaritone",
      images,
    },
  };
}

export const ABOUT_METADATA = pageMetadata({
  title: "About",
  description:
    "The Winamp Skin Museum: a fast, searchable and shareable way to browse the Internet Archive's collection of over 100,000 Winamp skins.",
  path: "/about",
});

export const FEEDBACK_METADATA = pageMetadata({
  title: "Feedback",
  description:
    "Send feedback about the Winamp Skin Museum: bugs, ideas, or skins that should or shouldn't be here.",
  path: "/feedback",
});
