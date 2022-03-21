import UI_ROOT from "../UIRoot";
import { num, px } from "../utils";
import Bitmap from "./Bitmap";
import ImageManager from "./ImageManager";

const CHARS =
  "abcdefghijklmnopqrstuvwxyz\"@  \n0123456789\u2026.:()-'!_+\\/[]^&%,=$#\nâöä?*";

const CHAR_MAP = {};
for (const [line, chars] of CHARS.split("\n").entries()) {
  for (const [col, char] of chars.split("").entries()) {
    CHAR_MAP[char] = [col, line];
  }
}

// http://wiki.winamp.com/wiki/XML_Elements#.3Cbitmapfont.2F.3E
export default class BitmapFont extends Bitmap {
  // _file: string;
  // _id: string;
  _charWidth: number;
  _charHeight: number;
  _horizontalSpacing: number;
  _verticalSpacing: number;
  _externalBitmap: boolean = false; //? true == _file = another.bitmap.id
  _bitmap: Bitmap = null;// the real external bitmap
  // _url: string;
  // _gammagroup: string;

  // setXmlAttributes(attributes: { [attrName: string]: string }) {
  //   for (const [key, value] of Object.entries(attributes)) {
  //     this.setXmlAttr(key, value);
  //   }
  // }

  setXmlAttr(_key: string, value: string):boolean {
    if (super.setXmlAttr(_key, value)) {
      return true;
    }

    const key = _key.toLowerCase();
    switch (key) {
      // case "id":
      //   this._id = value;
      //   break;
      // case "file":
      //   this._file = value;
      //   break;
      case "charwidth":
        this._charWidth = num(value);
        break;
      case "charheight":
        this._charHeight = num(value);
        break;
      case "hspacing":
        this._horizontalSpacing = num(value);
        break;
      case "vspacing":
        this._verticalSpacing = num(value);
        break;
      default:
        return false;
    }
    return true;
  }

  _setAsBackground(div: HTMLElement, prefix: string) {
    if(this._externalBitmap){
      if(!this._bitmap){
        this._bitmap = UI_ROOT.getBitmap(this._file)
      }
      if(this._bitmap != null){
        this._bitmap._setAsBackground(div, prefix);
      }
    } else {
      super._setAsBackground(div, prefix)
    }
  }

  // TODO: This could likely be made more efficient.
  // For example, if we could do this in CSS, we could define everything except
  // the background position just once.
  renderLetter(char: string): HTMLSpanElement {
    const span = document.createElement("span");
    // span.style.display = "inline-block";
    // span.style.width = px(this._charWidth);
    // span.style.height = px(this._charHeight);
    // span.style.backgroundImage = `url(${this._url})`;
    // span.style.verticalAlign = "top";
    const [x, y] = CHAR_MAP[char.toLocaleLowerCase()] ?? CHAR_MAP[" "];
    // span.style.backgroundPositionX = px(-(this._charWidth * x));
    // span.style.backgroundPositionY = px(-(this._charHeight * y));
    // span.style.paddingTop = px((this._verticalSpacing ?? 0) / 2);
    // span.style.paddingBottom = px((this._verticalSpacing ?? 0) / 2);
    // span.style.paddingLeft = px((this._horizontalSpacing ?? 0) / 2);
    // span.style.paddingRight = px((this._horizontalSpacing ?? 0) / 2);
    span.innerText = char; // Keep things accessible
    // span.style.textIndent = "-9999px"; // But hide the characters
    span.style.setProperty('--x', px(-(this._charWidth * x)));
    span.style.setProperty('--y', px(-(this._charHeight * y)));
    return span;
  }

  // Ensure we've loaded the font into our asset loader.
  // async ensureFontLoaded(imageManager: ImageManager) {
  //   // const imgUrl = await imageManager.getUrl(this._file);
  //   // this._url = imgUrl;
  //   this._img = await imageManager.getImage(this._file);
  // }
}
