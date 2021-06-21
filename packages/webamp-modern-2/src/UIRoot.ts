import Bitmap from "./skin/Bitmap";
import GroupDef from "./skin/GroupDef";
import TrueTypeFont from "./skin/TrueTypeFont";
import { assert } from "./utils";

class UIRoot {
  // Just a temporary place to stash things
  _bitmaps: Bitmap[] = [];
  _trueTypeFonts: TrueTypeFont[] = [];
  _groupDefs: GroupDef[] = [];

  addBitmap(bitmap: Bitmap) {
    this._bitmaps.push(bitmap);
  }

  getBitmap(id: string): Bitmap {
    const found = this._bitmaps.find(
      (bitmap) => bitmap._id.toLowerCase() === id.toLowerCase()
    );

    assert(found != null, `Could not find bitmap with id ${id}.`);
    return found;
  }

  addTrueTypeFont(font: TrueTypeFont) {
    this._trueTypeFonts.push(font);
  }

  getTrueTypeFont(id: string): TrueTypeFont {
    const found = this._trueTypeFonts.find(
      (font) => font.getId().toLowerCase() === id.toLowerCase()
    );

    assert(found != null, `Could not find bitmap with id ${id}.`);
    return found;
  }

  addGroupDef(groupDef: GroupDef) {
    this._groupDefs.push(groupDef);
  }

  getGroupDef(id: string): GroupDef {
    const found = this._groupDefs.find(
      (def) => def.getId().toLowerCase() === id.toLowerCase()
    );

    assert(found != null, `Could not find groupdef with id ${id}.`);
    return found;
  }
}

// Global Singleton for now
const UI_ROOT = new UIRoot();
export default UI_ROOT;
