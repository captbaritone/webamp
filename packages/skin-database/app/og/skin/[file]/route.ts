import { cachedImage, imageResponse, skinImage } from "../../ogImages";

// A skin's link preview image: /og/skin/:md5.png (see ogImages.tsx).
export const dynamic = "force-dynamic";

const FILE = /^([0-9a-f]{32})\.png$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const match = (await params).file.match(FILE);
  if (match == null) return new Response("Not Found", { status: 404 });
  const md5 = match[1];
  return imageResponse(
    cachedImage(`skin:${md5}`, async () => {
      const image = await skinImage(md5);
      if (image == null) throw new NotFound();
      return image;
    }).catch((error) => {
      if (error instanceof NotFound) return null;
      throw error;
    })
  );
}

class NotFound extends Error {}
