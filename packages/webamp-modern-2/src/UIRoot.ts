import Bitmap from "./skin/Bitmap";
import { XmlElement } from "@rgrove/parse-xml";
import TrueTypeFont from "./skin/TrueTypeFont";
import { assert } from "./utils";
import BitmapFont from "./skin/BitmapFont";

class UIRoot {
  // Just a temporary place to stash things
  _bitmaps: Bitmap[] = [];
  _fonts: (TrueTypeFont | BitmapFont)[] = [];
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

  addFont(font: TrueTypeFont | BitmapFont) {
    this._fonts.push(font);
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
