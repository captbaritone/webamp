import { assert, assume } from "../../utils";
import BaseObject from "./BaseObject";
import Bitmap from "../Bitmap";
import { UIRoot } from "../../UIRoot";

export default class MakiMap extends BaseObject {
  static GUID = "3860366542a7461b3fd875aa73bf6766";
  _uiRoot: UIRoot;
  _bitmap: Bitmap;

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
  }

  loadmap(bitmapId: string) {
    this._bitmap = this._uiRoot.getBitmap(bitmapId);
  }
  inregion(x: number, y: number): boolean {
    // Maybe this checks if the pixel is transparent?
    return true;
  }

  // 0-255
  getvalue(x: number, y: number): number {
    assume(x >= 0, `Expected x to be positive but it was ${x}`);
    assume(y >= 0, `Expected y to be positive but it was ${y}`);
    const canvas = this._bitmap.getCanvas(true); // since it used manytime, let bitmap remember (keep)
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(x, y, 1, 1);
    assert(
      data[0] === data[1] && data[0] === data[2],
      "Expected map image to be grey scale"
    );
    assume(data[3] === 255, "Expected map image not have transparency");
    return data[0];
  }
  // 0-255
  getUnsafeValue(x: number, y: number): number | null {
    const canvas = this._bitmap.getCanvas(true); // since it used manytime, let bitmap remember (keep)
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
      return null;
    }
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(x, y, 1, 1);
    if (!(data[0] === data[1] && data[0] === data[2]) || data[3] != 255) {
      return null;
    }
    return data[0];
  }
  getwidth(): number {
    return this._bitmap.getWidth();
  }
  getheight(): number {
    return this._bitmap.getHeight();
  }

  /*
extern Int Map.getARGBValue(int x, int y, int channel); // requires wa 5.51 // channel: 0=Blue, 1=Green, 2=Red, 3=Alpha. if your img has a alpha channal the returned rgb value might not be exact
extern Region Map.getRegion();
*/
}
