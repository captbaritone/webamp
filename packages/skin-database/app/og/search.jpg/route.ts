import type { NextRequest } from "next/server";
import { cachedImage, imageResponse, searchImage } from "../ogImages";

// A search's link preview image: /og/search.jpg?query=... (see ogImages.tsx).
export const dynamic = "force-dynamic";

// Longer than anyone types; keeps the title on the image.
const MAX_QUERY_LENGTH = 100;

export function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("query") ?? "")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
  if (query === "") return new Response("Not Found", { status: 404 });
  return imageResponse(
    cachedImage(`search:${query.toLowerCase()}`, () => searchImage(query))
  );
}
