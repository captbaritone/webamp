import JSZip from "jszip";
import { PlaylistStyle, SkinGenExColors } from "./types";
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
  return Utils.imgFromUrl(URL.createObjectURL(blob));
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

export async function getGenExColors(
  zip: JSZip
): Promise<null | SkinGenExColors> {
  const img = await getImgFromFilename(zip, "GENEX");
  if (img == null) {
    return null;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context == null) {
    return null;
  }
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);

  const getColorAt = (x: number): string =>
    `rgb(${context
      .getImageData(x, 0, 1, 1)
      // Discard the alpha channel
      .data.slice(0, 3)
      .join(",")})`;

  // Ideally we would just have a map from key to the x value and map over
  // that with getColorAt, but I don't know a great way to make that type
  // safe. So, we'll just do this for now, where we explicitly call getColorAt
  // for each key.
  return {
    // (1) x=48: item background (background to edits, listviews, etc.)
    itemBackground: getColorAt(48),
    // (2) x=50: item foreground (text colour of edits, listviews, etc.)
    itemForeground: getColorAt(50),
    // (3) x=52: window background (used to set the bg color for the dialog)
    windowBackground: getColorAt(52),
    // (4) x=54: button text colour
    buttonText: getColorAt(54),
    // (5) x=56: window text colour
    windowText: getColorAt(56),
    // (6) x=58: colour of dividers and sunken borders
    divider: getColorAt(58),
    // (7) x=60: selection colour for entries inside playlists (nothing else yet)
    playlistSelection: getColorAt(60),
    // (8) x=62: listview header background colour
    listHeaderBackground: getColorAt(62),
    // (9) x=64: listview header text colour
    listHeaderText: getColorAt(64),
    // (10) x=66: listview header frame top and left colour
    listHeaderFrameTopAndLeft: getColorAt(66),
    // (11) x=68: listview header frame bottom and right colour
    listHeaderFrameBottomAndRight: getColorAt(68),
    // (12) x=70: listview header frame colour, when pressed
    listHeaderFramePressed: getColorAt(70),
    // (13) x=72: listview header dead area colour
    listHeaderDeadArea: getColorAt(72),
    // (14) x=74: scrollbar colour #1
    scrollbarOne: getColorAt(74),
    // (15) x=76: scrollbar colour #2
    scrollbarTwo: getColorAt(76),
    // (16) x=78: pressed scrollbar colour #1
    pressedScrollbarOne: getColorAt(78),
    // (17) x=80: pressed scrollbar colour #2
    pressedScrollbarTwo: getColorAt(80),
    // (18) x=82: scrollbar dead area colour
    scrollbarDeadArea: getColorAt(82),
    // (19) x=84 List view text colour highlighted
    listTextHighlighted: getColorAt(84),
    // (20) x=86 List view background colour highlighted
    listTextHighlightedBackground: getColorAt(86),
    // (21) x=88 List view text colour selected
    listTextSelected: getColorAt(88),
    // (22) x=90 List view background colour selected
    listTextSelectedBackground: getColorAt(90),
  };
}
