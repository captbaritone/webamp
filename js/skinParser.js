import SKIN_SPRITES from "./skinSprites";
import JSZip from "../node_modules/jszip/dist/jszip"; // Hack
import { parseViscolors, parseIni } from "./utils";

const bmpUriFromBase64 = data64 => `data:image/bmp;base64,${data64}`;

const genImgNodeFromUri = uri =>
  new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.src = uri;
  });

// "Promisify" processBuffer
const genBufferFromFile = file =>
  new Promise(resolve => {
    file.processBuffer(resolve);
  });

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

async function genSpriteUrisFromFilename(zip, fileName) {
  const base64 = await genFileFromZip(zip, fileName, "bmp", "base64");
  if (!base64) {
    return {};
  }
  const uri = bmpUriFromBase64(base64);
  const img = await genImgNodeFromUri(uri);
  const spriteUris = getSpriteUrisFromImg(img, SKIN_SPRITES[fileName]);
  return spriteUris;
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
  Normal: "#00FF00",
  Current: "#FFFFFF",
  NormalBG: "#000000",
  SelectedBG: "#0000FF",
  Font: "Arial"
};

// A promise that, given a File object, returns a skin style object
async function parseSkin(zipFile) {
  const buffer = await genBufferFromFile(zipFile);
  const zip = await JSZip.loadAsync(buffer);
  const imageObjs = await Promise.all(
    Object.keys(SKIN_SPRITES).map(
      async fileName => await genSpriteUrisFromFilename(zip, fileName)
    )
  );

  // Merge all the objects into a single object. Tests assert that sprite keys are unique.
  const images = imageObjs.reduce(Object.assign, {});

  const viscolorContent = await genFileFromZip(zip, "VISCOLOR", "txt", "text");
  const colors = viscolorContent
    ? parseViscolors(viscolorContent)
    : defaultVisColors;

  const pleditContent = await genFileFromZip(zip, "PLEDIT", "txt", "text");
  const playlistStyle = pleditContent
    ? parseIni(pleditContent)
    : defaultPlaylistStyle;

  return { colors, playlistStyle, images };
}

export default parseSkin;
