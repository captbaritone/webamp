import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class MakiMap extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Map";
  }

  loadmap(bitmapid: string): void {
    unimplementedWarning("loadmap");
  }

  getwidth(): number {
    unimplementedWarning("getwidth");
    return 10;
  }

  getheight(): number {
    unimplementedWarning("getheight");
    return 10;
  }

  getvalue(x: number, y: number): number {
    return unimplementedWarning("getvalue");
  }

  inregion(x: number, y: number): boolean {
    return unimplementedWarning("inregion");
  }

  getregion() {
    return unimplementedWarning("getregion");
  }

  getargbvalue(x: number, y: number, channel: number): number {
    return unimplementedWarning("getargbvalue");
  }
}

export default MakiMap;
