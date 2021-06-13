import Bitmap from "./skin/Bitmap";
import { assert } from "./utils";

class UIRoot {
  // Just a temporary place to stash things
  _bitmaps: Bitmap[] = [];

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
}

// Global Singleton for now
const UI_ROOT = new UIRoot();
export default UI_ROOT;
