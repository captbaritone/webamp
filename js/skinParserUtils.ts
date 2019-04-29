import JSZip from "jszip";
import { PlaylistStyle } from "./types";
import SKIN_SPRITES, { Sprite } from "./skinSprites";
import { DEFAULT_SKIN } from "./constants";
import * as Utils from "./utils";

export const getFileExtension = (fileName: string): string | null => {
  const matches = /\.([a-z]{3,4})$/i.exec(fileName);
  return matches ? matches[1].toLowerCase() : null;
};

function getFilenameRegex(base: string, ext: string): RegExp {
  return new RegExp(`^(.*/)?${base}(\.${ext})?$`, "i");
}

export async function getFileFromZip(
  zip: JSZip,
  fileName: string,
  ext: string,
  mode: "blob" | "text" | "base64"
) {
  const files = zip.file(getFilenameRegex(fileName, ext));
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

export async function getImgFromFilename(
  zip: JSZip,
  fileName: string
): Promise<HTMLImageElement | ImageBitmap | null> {
  // Winamp only supports .bmp images, but WACUP set a precidence of supporting
  // .png as well to reduce size. Since we care about size as well, we follow
  // suit. Our default skin uses .png to save 14kb.
  const file = await getFileFromZip(zip, fileName, "(png|bmp)", "blob");
  if (!file) {
    return null;
  }

  const mimeType = `image/${getFileExtension(file.name) || "*"}`;
  // The spec for createImageBitmap() says the browser should try to sniff the
  // mime type, but it looks like Firefox does not. So we specify it here
  // explicitly.
  const typedBlob = new Blob([file.contents], { type: mimeType });
  return getImgFromBlob(typedBlob);
}

export async function getSpriteUrisFromFilename(
  zip: JSZip,
  fileName: string
): Promise<{ [spriteName: string]: string }> {
  const img = await getImgFromFilename(zip, fileName);
  if (img == null) {
    return {};
  }
  return getSpriteUrisFromImg(img, SKIN_SPRITES[fileName]);
}

export async function getCursorFromFilename(
  zip: JSZip,
  fileName: string
): Promise<string | null> {
  const file = await getFileFromZip(zip, fileName, "CUR", "base64");
  return file == null
    ? null
    : `data:image/x-win-bitmap;base64,${file.contents}`;
}

export async function getPlaylistStyle(zip: JSZip): Promise<PlaylistStyle> {
  const files = zip.file(getFilenameRegex("PLEDIT", "txt"));
  const file = files[0];
  if (file == null) {
    return DEFAULT_SKIN.playlistStyle;
  }
  const ini = await file.async("text");
  if (ini == null) {
    return DEFAULT_SKIN.playlistStyle;
  }
  const data = ini && Utils.parseIni(ini).text;
  if (!data) {
    // Corrupt or missing PLEDIT.txt file.
    return DEFAULT_SKIN.playlistStyle;
  }

  // Winamp seems to permit colors that contain too many characters.
  // For compatibility with existing skins, we normalize them here.
  ["normal", "current", "normalbg", "selectedbg", "mbFG", "mbBG"].forEach(
    colorKey => {
      let color = data[colorKey];
      if (!color) {
        return;
      }
      if (color[0] !== "#") {
        color = `#${color}`;
      }
      data[colorKey] = color.slice(0, 7);
    }
  );

  return { ...DEFAULT_SKIN.playlistStyle, ...data };
}
