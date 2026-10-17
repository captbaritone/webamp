import { cachedImage, imageResponse, museumImage } from "../ogImages";

// The museum's link preview image (see ogImages.tsx).
export const dynamic = "force-dynamic";

export function GET() {
  return imageResponse(cachedImage("museum", museumImage));
}
