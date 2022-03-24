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
  _charWidth: number;
  _charHeight: number;
  _horizontalSpacing: number;
  _verticalSpacing: number;
  _externalBitmap: boolean = false; //? true == _file = another.bitmap.id
  _bitmap: Bitmap = null; // the real external bitmap

  setXmlAttr(_key: string, value: string): boolean {
    if (super.setXmlAttr(_key, value)) {
      return true;
    }

    const key = _key.toLowerCase();
    switch (key) {
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
    if (this._externalBitmap) {
      if (!this._bitmap) {
        this._bitmap = UI_ROOT.getBitmap(this._file);
      }
      if (this._bitmap != null) {
        this._bitmap._setAsBackground(div, prefix);
      }
    } else {
      super._setAsBackground(div, prefix);
    }
  }

  // TODO: This could likely be made more efficient.
  // For example, if we could do this in CSS, we could define everything except
  // the background position just once.
  renderLetter(char: string): HTMLSpanElement {
    const span = document.createElement("span");
    const [x, y] = CHAR_MAP[char.toLocaleLowerCase()] ?? CHAR_MAP[" "];
    span.innerText = char; // Keep things accessible
    span.style.setProperty("--x", px(-(this._charWidth * x)));
    span.style.setProperty("--y", px(-(this._charHeight * y)));
    return span;
  }

  useExternalBitmap(): boolean {
    return this._externalBitmap;
  }

  setExternalBitmap(isExternal: boolean) {
    this._externalBitmap = isExternal;
  }

}
