import Bitmap from "./skin/Bitmap";
import { XmlElement } from "@rgrove/parse-xml";
import TrueTypeFont from "./skin/TrueTypeFont";
import { assert } from "./utils";
import BitmapFont from "./skin/BitmapFont";
import Color from "./skin/Color";

class UIRoot {
  // Just a temporary place to stash things
  _bitmaps: Bitmap[] = [];
  _bitmapImages: Map<string, HTMLImageElement> = new Map();
  _fonts: (TrueTypeFont | BitmapFont)[] = [];
  _colors: Color[] = [];
  _groupDefs: XmlElement[] = [];
  _xuiElements: XmlElement[] = [];

  addBitmap(bitmap: Bitmap) {
    this._bitmaps.push(bitmap);
  }

  // TODO: Maybe return a default bitmap?
  getBitmap(id: string): Bitmap {
    const lowercaseId = id.toLowerCase();
    const found = this._bitmaps.find(
      (bitmap) => bitmap._id.toLowerCase() === lowercaseId
    );

    assert(found != null, `Could not find bitmap with id ${id}.`);
    return found;
  }

  addBitmapImage(id: string, image: HTMLImageElement) {
    this._bitmapImages.set(id, image);
  }

  addFont(font: TrueTypeFont | BitmapFont) {
    this._fonts.push(font);
  }
  addColor(color: Color) {
    this._colors.push(color);
  }

  getColor(id: string): Color {
    const lowercaseId = id.toLowerCase();
    const found = this._colors.find(
      (color) => color._id.toLowerCase() === lowercaseId
    );

    assert(found != null, `Could not find color with id ${id}.`);
    return found;
  }

  getFont(id: string): TrueTypeFont | BitmapFont {
    const found = this._fonts.find(
      (font) => font.getId().toLowerCase() === id.toLowerCase()
    );

    assert(found != null, `Could not find true type font with id ${id}.`);
    return found;
  }

  addGroupDef(groupDef: XmlElement) {
    this._groupDefs.push(groupDef);
    if (groupDef.attributes.xuitag) {
      this._xuiElements.push(groupDef);
    }
  }

  getGroupDef(id: string): XmlElement | null {
    const lowercaseId = id.toLowerCase();
    const found = this._groupDefs.find(
      (def) => def.attributes.id.toLowerCase() === lowercaseId
    );

    return found ?? null;
  }

  getXuiElement(name: string): XmlElement | null {
    const lowercaseName = name.toLowerCase();
    const found = this._xuiElements.find(
      (def) => def.attributes.xuitag.toLowerCase() === lowercaseName
    );

    return found ?? null;
  }
}

// Global Singleton for now
const UI_ROOT = new UIRoot();
export default UI_ROOT;
