import JSZip from "../node_modules/jszip/dist/jszip"; // Hack
import SKIN_SPRITES from "./skinSprites";
import regionParser from "./regionParser";
import { LETTERS } from "./constants";
import { parseViscolors, parseIni } from "./utils";

const shallowMerge = objs =>
  objs.reduce((prev, img) => Object.assign(prev, img), {});

const CURSORS = [
  "CLOSE",
  "EQCLOSE",
  "EQNORMAL",
  "EQSLID",
  "EQTITLE",
  "MAINMENU",
  "MMENU",
  "MIN",
  "NORMAL",
  "PCLOSE",
  "PNORMAL",
  "POSBAR",
  "PSIZE",
  "PTBAR",
  "PVSCROLL",
  "PWINBUT",
  "PWSNORM",
  "PWSSIZE",
  "SONGNAME",
  "TITLEBAR",
  "VOLBAL",
  "WINBUT",
  "WSNORMAL",
  "WSPOSBAR"
  /*
   * > There are usually 4 more cursors in the skins: volbar.cur, wsclose.cur,
   * > wswinbut.cur, wsmin.cur, but they are never used, at least in the last
   * > versions of winamp, so there's no need of including them. The cursors
   * > shown when the mouse is over the app-buttons are the same in normal and
   * > winshade mode, except for the main menu button. You can make animated
   * > cursors, but you have to name them with the extension .cur (animated
   * > cursors are usually .ani files).
   *
   * -- Skinners Atlas
   *
   * "VOLBAR",
   * "WSCLOSE",
   * "WSWINBUT",
   * "WSMIN",
   *
   */
];

const _genImgFromBlob = async blob =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Schedule cleanup of object url?
      // Maybe on next tick, or with requestidlecallback
      resolve(img);
    };
    img.onerror = () => reject("Failed to decode image");
    img.src = URL.createObjectURL(blob);
  });

const genImgFromBlob = async blob => {
  if (window.createImageBitmap) {
    try {
      // Use this faster native browser API if avaliable.
      return await window.createImageBitmap(blob);
    } catch (e) {
      console.warn(
        "Encountered an error with createImageBitmap. Falling back to Image approach."
      );
      // There are some bugs in the new API. In case something goes wrong, we call fall back.
      return _genImgFromBlob(blob);
    }
  }
  return _genImgFromBlob(blob);
};

async function genFileFromZip(zip, fileName, ext, mode) {
  const regex = new RegExp(`^(.*/)?${fileName}(\.${ext})?$`, "i");
  const files = zip.file(regex);
  if (!files.length) {
    return null;
  }
  // Return a promise (awaitable).
  return files[0].async(mode);
}

function getSpriteUrisFromImg(img, sprites) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  return sprites.reduce((images, sprite) => {
    canvas.height = sprite.height;
    canvas.width = sprite.width;

    context.drawImage(img, -sprite.x, -sprite.y);
    const image = canvas.toDataURL();
    images[sprite.name] = image;
    return images;
  }, {});
}

async function genImgFromFilename(zip, fileName) {
  const blob = await genFileFromZip(zip, fileName, "bmp", "blob");
  if (!blob) {
    return null;
  }
  // The spec for createImageBitmap() says the browser should try to sniff the
  // mime type, but it looks like Firefox does not. So we specify it here
  // explicitly.
  const typedBlob = new Blob([blob], { type: "image/bmp" });
  return genImgFromBlob(typedBlob);
}

async function genSpriteUrisFromFilename(zip, fileName) {
  const img = await genImgFromFilename(zip, fileName);
  if (img == null) {
    return {};
  }
  return getSpriteUrisFromImg(img, SKIN_SPRITES[fileName]);
}

async function getCursorFromFilename(zip, fileName) {
  const base64 = await genFileFromZip(zip, fileName, "CUR", "base64");
  return base64 && `data:image/x-win-bitmap;base64,${base64}`;
}

const defaultVisColors = [
  "rgb(0,0,0)",
  "rgb(24,33,41)",
  "rgb(239,49,16)",
  "rgb(206,41,16)",
  "rgb(214,90,0)",
  "rgb(214,102,0)",
  "rgb(214,115,0)",
  "rgb(198,123,8)",
  "rgb(222,165,24)",
  "rgb(214,181,33)",
  "rgb(189,222,41)",
  "rgb(148,222,33)",
  "rgb(41,206,16)",
  "rgb(50,190,16)",
  "rgb(57,181,16)",
  "rgb(49,156,8)",
  "rgb(41,148,0)",
  "rgb(24,132,8)",
  "rgb(255,255,255)",
  "rgb(214,214,222)",
  "rgb(181,189,189)",
  "rgb(160,170,175)",
  "rgb(148,156,165)",
  "rgb(150,150,150)"
];

const defaultPlaylistStyle = {
  normal: "#00FF00",
  current: "#FFFFFF",
  normalbg: "#000000",
  selectedbg: "#0000FF",
  font: "Arial"
};

async function genPlaylistStyle(zip) {
  const pleditContent = await genFileFromZip(zip, "PLEDIT", "txt", "text");
  const data = pleditContent && parseIni(pleditContent).text;
  if (!data) {
    // Corrupt or missing PLEDIT.txt file.
    return defaultPlaylistStyle;
  }

  // Winamp seems to permit colors that contain too many characters.
  // For compatibility with existing skins, we normalize them here.
  ["normal", "current", "normalbg", "selectedbg"].forEach(colorKey => {
    let color = data[colorKey];
    if (!color) {
      return;
    }
    if (color[0] !== "#") {
      color = `#${color}`;
    }
    data[colorKey] = color.slice(0, 7);
  });

  return { ...defaultPlaylistStyle, ...data };
}

async function genColors(zip) {
  const viscolorContent = await genFileFromZip(zip, "VISCOLOR", "txt", "text");
  return viscolorContent ? parseViscolors(viscolorContent) : defaultVisColors;
}

async function genImages(zip) {
  const imageObjs = await Promise.all(
    Object.keys(SKIN_SPRITES).map(async fileName =>
      genSpriteUrisFromFilename(zip, fileName)
    )
  );
  // Merge all the objects into a single object. Tests assert that sprite keys are unique.
  return shallowMerge(imageObjs);
}
async function genCursors(zip) {
  const cursorObjs = await Promise.all(
    CURSORS.map(async cursorName => ({
      [cursorName]: await getCursorFromFilename(zip, cursorName)
    }))
  );
  return shallowMerge(cursorObjs);
}

async function genRegion(zip) {
  const regionContent = await genFileFromZip(zip, "REGION", "txt", "text");
  return regionContent ? regionParser(regionContent) : {};
}

async function genGenTextSprites(zip) {
  const img = await genImgFromFilename(zip, "GEN");
  if (img == null) {
    return null;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);

  const getLetters = (y, prefix) => {
    const getColorAt = x => context.getImageData(x, y, 1, 1).data.join(",");

    let x = 1;
    const backgroundColor = getColorAt(0);

    const height = 7;
    return LETTERS.map(letter => {
      let nextBackground = x;
      while (
        getColorAt(nextBackground) !== backgroundColor &&
        nextBackground < canvas.width
      ) {
        nextBackground++;
      }
      const width = nextBackground - x;
      const name = `${prefix}_${letter}`;
      const sprite = { x, y, height, width, name };
      x = nextBackground + 1;
      return sprite;
    });
  };

  const letterWidths = {};
  const sprites = [
    ...getLetters(88, "GEN_TEXT_SELECTED"),
    ...getLetters(96, "GEN_TEXT")
  ];
  sprites.forEach(sprite => {
    letterWidths[sprite.name] = sprite.width;
  });
  return [letterWidths, getSpriteUrisFromImg(img, sprites)];
}

// A promise that, given an array buffer  returns a skin style object
async function skinParser(zipFileBuffer) {
  const zip = await JSZip.loadAsync(zipFileBuffer);
  const [
    colors,
    playlistStyle,
    images,
    cursors,
    region,
    genTextSprites
  ] = await Promise.all([
    genColors(zip),
    genPlaylistStyle(zip),
    genImages(zip),
    genCursors(zip),
    genRegion(zip),
    genGenTextSprites(zip)
  ]);

  const [genLetterWidths, genTextImages] = genTextSprites || [null, {}];

  return {
    colors,
    playlistStyle,
    images: { ...images, ...genTextImages },
    genLetterWidths,
    cursors,
    region
  };
}

export default skinParser;
