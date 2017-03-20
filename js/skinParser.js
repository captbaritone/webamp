import SKIN_SPRITES from "./skinSprites";
import JSZip from "../node_modules/jszip/dist/jszip"; // Hack
import { parseViscolors, parseIni } from "./utils";

const bmpUriFromFile = file => `data:image/bmp;base64,${btoa(file.asBinary())}`;

// "Promisify" processBuffer
const getBufferFromFile = file =>
  new Promise(resolve => {
    file.processBuffer(resolve);
  });

const getZipFromBuffer = buffer => new JSZip(buffer);

const getSpriteSheetFilesFromZip = zip => {
  const spriteObjs = SKIN_SPRITES.map(spriteObj => ({
    ...spriteObj,
    file: zip.file(new RegExp(`(/|^)${spriteObj.name}`, "i"))[0]
  }));
  return spriteObjs.filter(spriteObj => spriteObj.file);
};

// Extract the CSS rules for a given file, and add them to the object
const extractCss = spriteObj =>
  new Promise(resolve => {
    const uri = bmpUriFromFile(spriteObj.file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const images = {};
      spriteObj.sprites.forEach(sprite => {
        canvas.height = sprite.height;
        canvas.width = sprite.width;

        const context = canvas.getContext("2d");
        context.drawImage(img, -sprite.x, -sprite.y);
        const image = canvas.toDataURL();
        if (sprite.name) {
          images[sprite.name] = image;
        }
      });
      resolve({ ...spriteObj, images });
    };
    img.src = uri;
  });

// Extract the color data from a VISCOLOR.TXT file and add it to the object
const extractColors = spriteObj => ({
  ...spriteObj,
  colors: parseViscolors(spriteObj.file.asText())
});

// Extract the color data from a VISCOLOR.TXT file and add it to the object
const extractPlaylistStyle = spriteObj => ({
  ...spriteObj,
  playlistStyle: parseIni(spriteObj.file.asText())
});

const getSkinDataFromFiles = spriteObjs =>
  Promise.all(
    spriteObjs.map(spriteObj => {
      switch (spriteObj.name) {
        case "VISCOLOR":
          return extractColors(spriteObj);
        case "PLEDIT.TXT":
          return extractPlaylistStyle(spriteObj);
        default:
          return extractCss(spriteObj);
      }
    })
  );

const collectCssAndColors = spriteObjs => {
  let images = {};
  let colors = null;
  let playlistStyle = null;
  spriteObjs.forEach(spriteObj => {
    if (spriteObj.images) {
      images = { ...images, ...spriteObj.images };
    }
    if (spriteObj.colors) {
      colors = spriteObj.colors;
    }
    if (spriteObj.playlistStyle) {
      playlistStyle = spriteObj.playlistStyle;
    }
  });

  return {
    images,
    colors,
    playlistStyle
  };
};

// A promise that, given a File object, returns a skin style object
const parseSkin = file =>
  getBufferFromFile(file)
    .then(getZipFromBuffer)
    .then(getSpriteSheetFilesFromZip)
    .then(getSkinDataFromFiles)
    .then(collectCssAndColors);

export default parseSkin;
