import SKIN_SPRITES from './skinSprites';
import JSZip from '../node_modules/jszip/dist/jszip'; // Hack
import {parseViscolors, parseIni} from './utils';

const bmpUriFromFile = (file) => {
  return `data:image/bmp;base64,${btoa(file.asBinary())}`;
};

// "Promisify" processBuffer
const getBufferFromFile = (file) => {
  return new Promise((resolve) => {
    file.processBuffer(resolve);
  });
};

const getZipFromBuffer = (buffer) => new JSZip(buffer);

const getSpriteSheetFilesFromZip = (zip) => {
  const spriteObjs = SKIN_SPRITES.map((spriteObj) => ({
    ...spriteObj,
    file: zip.file(new RegExp(`(/|^)${spriteObj.name}`, 'i'))[0]
  }));
  return spriteObjs.filter((spriteObj) => spriteObj.file);
};

// Extract the CSS rules for a given file, and add them to the object
const extractCss = (spriteObj) => {
  return new Promise((resolve) => {
    const uri = bmpUriFromFile(spriteObj.file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const cssRules = [];
      spriteObj.sprites.forEach((sprite) => {
        canvas.height = sprite.height;
        canvas.width = sprite.width;

        const context = canvas.getContext('2d');
        context.drawImage(img, -sprite.x, -sprite.y);
        const value = `background-image: url(${canvas.toDataURL()})`;
        sprite.selectors.forEach((selector) => {
          cssRules.push(`#winamp2-js ${selector} {${value}}`);
        });
      });
      if (name === 'NUMS_EX') {
        // This alternate number file requires that the minus sign be
        // formatted differently.
        cssRules.push('#winamp2-js .status #time #minus-sign { top: 0px; left: -1px; width: 9px; height: 13px; }');
        resolve(name);
      }
      resolve({...spriteObj, cssRules});
    };
    img.src = uri;
  });
};

// Extract the color data from a VISCOLOR.TXT file and add it to the object
const extractColors = (spriteObj) => {
  return {
    ...spriteObj,
    colors: parseViscolors(spriteObj.file.asText())
  };
};

// Extract the color data from a VISCOLOR.TXT file and add it to the object
const extractPlaylistStyle = (spriteObj) => {
  return {
    ...spriteObj,
    playlistStyle: parseIni(spriteObj.file.asText())
  };
};

const getSkinDataFromFiles = (spriteObjs) => {
  return Promise.all(spriteObjs.map((spriteObj) => {
    switch (spriteObj.name) {
      case 'VISCOLOR':
        return extractColors(spriteObj);
      case 'PLEDIT.TXT':
        return extractPlaylistStyle(spriteObj);
      default:
        return extractCss(spriteObj);
    }
  }));
};

const collectCssAndColors = (spriteObjs) => {
  let cssRules = [];
  let colors = null;
  let playlistStyle = null;
  spriteObjs.forEach((spriteObj) => {
    if (spriteObj.cssRules) {
      cssRules = cssRules.concat(spriteObj.cssRules);
    }
    if (spriteObj.colors) {
      colors = spriteObj.colors;
    }
    if (spriteObj.playlistStyle) {
      playlistStyle = spriteObj.playlistStyle;
    }
  });

  return {
    css: cssRules.join('\n'),
    colors,
    playlistStyle
  };
};

// A promise that, given a File object, returns a skin style object
const parseSkin = (file) => {
  return getBufferFromFile(file)
    .then(getZipFromBuffer)
    .then(getSpriteSheetFilesFromZip)
    .then(getSkinDataFromFiles)
    .then(collectCssAndColors);
};

module.exports = parseSkin;
