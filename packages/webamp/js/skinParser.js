import SKIN_SPRITES from "./skinSprites";
import regionParser from "./regionParser";
import { LETTERS, DEFAULT_SKIN } from "./constants";
import { parseViscolors } from "./utils";
import * as SkinParserUtils from "./skinParserUtils";

const shallowMerge = (objs) =>
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
  "WSPOSBAR",
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

async function genVizColors(zip) {
  const viscolor = await SkinParserUtils.getFileFromZip(
    zip,
    "VISCOLOR",
    "txt",
    "text"
  );
  return viscolor ? parseViscolors(viscolor.contents) : DEFAULT_SKIN.colors;
}

async function genImages(zip) {
  const imageObjs = await Promise.all(
    Object.keys(SKIN_SPRITES).map((fileName) =>
      SkinParserUtils.getSpriteUrisFromFilename(zip, fileName)
    )
  );
  // Merge all the objects into a single object. Tests assert that sprite keys are unique.
  return shallowMerge(imageObjs);
}
async function genCursors(zip) {
  const cursorObjs = await Promise.all(
    CURSORS.map(async (cursorName) => ({
      [cursorName]: await SkinParserUtils.getCursorFromFilename(
        zip,
        cursorName
      ),
    }))
  );
  return shallowMerge(cursorObjs);
}

async function genRegion(zip) {
  const region = await SkinParserUtils.getFileFromZip(
    zip,
    "REGION",
    "txt",
    "text"
  );
  return region ? regionParser(region.contents) : {};
}

async function genGenTextSprites(zip) {
  const img = await SkinParserUtils.getImgFromFilename(zip, "GEN");
  if (img == null) {
    return null;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);

  const getLetters = (y, prefix) => {
    const getColorAt = (x) => context.getImageData(x, y, 1, 1).data.join(",");

    let x = 1;
    const backgroundColor = getColorAt(0);

    const height = 7;
    return LETTERS.map((letter) => {
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
    ...getLetters(96, "GEN_TEXT"),
  ];
  sprites.forEach((sprite) => {
    letterWidths[sprite.name] = sprite.width;
  });
  return [letterWidths, SkinParserUtils.getSpriteUrisFromImg(img, sprites)];
}

// A promise that, given an array buffer returns a skin style object
async function skinParser(zipFileBuffer, JSZip) {
  const zip = await JSZip.loadAsync(zipFileBuffer);

  const [
    colors,
    playlistStyle,
    images,
    cursors,
    region,
    genTextSprites,
    genExColors,
  ] = await Promise.all([
    genVizColors(zip),
    SkinParserUtils.getPlaylistStyle(zip),
    genImages(zip),
    genCursors(zip),
    genRegion(zip),
    genGenTextSprites(zip),
    SkinParserUtils.getGenExColors(zip),
  ]);

  const [genLetterWidths, genTextImages] = genTextSprites || [null, {}];

  return {
    colors,
    playlistStyle,
    images: { ...images, ...genTextImages },
    genLetterWidths,
    cursors,
    region,
    genExColors,
  };
}

export default skinParser;
