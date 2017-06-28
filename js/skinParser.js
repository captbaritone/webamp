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

  // TODO: Handle this being null.
  const viscolorContent = await genFileFromZip(zip, "VISCOLOR", "txt", "text");
  const colors = parseViscolors(viscolorContent);

  // TODO: Handle this being null.
  const pleditContent = await genFileFromZip(zip, "PLEDIT", "txt", "text");
  const playlistStyle = parseIni(pleditContent);

  return { colors, playlistStyle, images };
}

export default parseSkin;
