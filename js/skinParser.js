import SKIN_SPRITES from "./skinSprites";
import regionParser from "./regionParser";
import { LETTERS, DEFAULT_SKIN } from "./constants";
import { parseViscolors, parseIni, objectMap } from "./utils";
import * as SkinParserUtils from "./skinParserUtils";

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

async function getCursorFromFilename(zip, fileName) {
  const file = await SkinParserUtils.getFileFromZip(
    zip,
    fileName,
    "CUR",
    "base64"
  );
  return file && `data:image/x-win-bitmap;base64,${file.contents}`;
}

async function genPlaylistStyle(zip) {
  const pledit = await SkinParserUtils.getFileFromZip(
    zip,
    "PLEDIT",
    "txt",
    "text"
  );
  const data = pledit && parseIni(pledit.contents).text;
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
    Object.keys(SKIN_SPRITES).map(fileName =>
      SkinParserUtils.getSpriteUrisFromFilename(zip, fileName)
    )
  );
  // Merge all the objects into a single object. Tests assert that sprite keys are unique.
  return shallowMerge(imageObjs);
}
async function genCursors(zip) {
  const cursorObjs = await Promise.all(
    CURSORS.map(async cursorName => ({
      [cursorName]: await getCursorFromFilename(zip, cursorName),
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
    ...getLetters(96, "GEN_TEXT"),
  ];
  sprites.forEach(sprite => {
    letterWidths[sprite.name] = sprite.width;
  });
  return [letterWidths, SkinParserUtils.getSpriteUrisFromImg(img, sprites)];
}

async function genGenExColors(zip) {
  const img = await SkinParserUtils.getImgFromFilename(zip, "GENEX");
  if (img == null) {
    return null;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);

  const getColorAt = x =>
    `rgb(${context
      .getImageData(x, 0, 1, 1)
      // Discard the alpha channel
      .data.slice(0, 3)
      .join(",")})`;

  const colors = {
    // (1) x=48: item background (background to edits, listviews, etc.)
    itemBackground: 48,
    // (2) x=50: item foreground (text colour of edits, listviews, etc.)
    itemForeground: 50,
    // (3) x=52: window background (used to set the bg color for the dialog)
    windowBackground: 52,
    // (4) x=54: button text colour
    buttonText: 54,
    // (5) x=56: window text colour
    windowText: 56,
    // (6) x=58: colour of dividers and sunken borders
    divider: 58,
    // (7) x=60: selection colour for entries inside playlists (nothing else yet)
    playlistSelection: 60,
    // (8) x=62: listview header background colour
    listHeaderBackground: 62,
    // (9) x=64: listview header text colour
    listHeaderText: 64,
    // (10) x=66: listview header frame top and left colour
    listHeaderFrameTopAndLeft: 66,
    // (11) x=68: listview header frame bottom and right colour
    listHeaderFrameBottomAndRight: 68,
    // (12) x=70: listview header frame colour, when pressed
    listHeaderFramePressed: 70,
    // (13) x=72: listview header dead area colour
    listHeaderDeadArea: 72,
    // (14) x=74: scrollbar colour #1
    scrollbarOne: 74,
    // (15) x=76: scrollbar colour #2
    scrollbarTwo: 76,
    // (16) x=78: pressed scrollbar colour #1
    pressedScrollbarOne: 78,
    // (17) x=80: pressed scrollbar colour #2
    pressedScrollbarTwo: 80,
    // (18) x=82: scrollbar dead area colour
    scrollbarDeadArea: 82,
    // (19) x=84 List view text colour highlighted
    listTextHighlighted: 84,
    // (20) x=86 List view background colour highlighted
    listTextHighlightedBackground: 86,
    // (21) x=88 List view text colour selected
    listTextSelected: 88,
    // (22) x=90 List view background colour selected
    listTextSelectedBackground: 90,
  };

  return objectMap(colors, getColorAt);
}

// A promise that, given an array buffer  returns a skin style object
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
    genPlaylistStyle(zip),
    genImages(zip),
    genCursors(zip),
    genRegion(zip),
    genGenTextSprites(zip),
    genGenExColors(zip),
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
