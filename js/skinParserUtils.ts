import JSZip from "jszip";
import { Sprite } from "./skinSprites";

export async function getFileFromZip(
  zip: JSZip,
  fileName: string,
  ext: string,
  mode: "blob" | "text" | "base64"
) {
  const regex = new RegExp(`^(.*/)?${fileName}(\.${ext})?$`, "i");
  const files = zip.file(regex);
  if (!files.length) {
    return null;
  }
  // Return a promise (awaitable).
  return {
    contents: await files[0].async(mode),
    name: files[0].name,
  };
}

function fallbackGetImgFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Schedule cleanup of object url?
      // Maybe on next tick, or with requestidlecallback
      resolve(img);
    };
    img.onerror = () => reject("Failed to decode image");
    img.src = URL.createObjectURL(blob);
  });
}

export function getImgFromBlob(
  blob: Blob
): Promise<ImageBitmap | HTMLImageElement> {
  if (window.createImageBitmap) {
    try {
      // Use this faster native browser API if available.
      return window.createImageBitmap(blob);
    } catch (e) {
      console.warn(
        "Encountered an error with createImageBitmap. Falling back to Image approach."
      );
      // There are some bugs in the new API. In case something goes wrong, we call fall back.
      return fallbackGetImgFromBlob(blob);
    }
  }
  return fallbackGetImgFromBlob(blob);
}

export function getSpriteUrisFromImg(
  img: HTMLImageElement | ImageBitmap,
  sprites: Sprite[]
): { [spriteName: string]: string } {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context == null) {
    throw new Error("Failed to get canvas context");
  }
  const images: { [spriteName: string]: string } = {};
  sprites.forEach(sprite => {
    canvas.height = sprite.height;
    canvas.width = sprite.width;

    context.drawImage(img, -sprite.x, -sprite.y);
    const image = canvas.toDataURL();
    images[sprite.name] = image;
  });
  return images;
}
