import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class Map extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Map";
  }

  loadmap(bitmapid: string) {
    unimplementedWarning("loadmap");
  }

  getwidth() {
    unimplementedWarning("getwidth");
    return 10;
  }

  getheight() {
    unimplementedWarning("getheight");
    return 10;
  }

  getvalue(x: number, y: number) {
    unimplementedWarning("getvalue");
    return;
  }

  inregion(x: number, y: number) {
    unimplementedWarning("inregion");
    return;
  }

  getregion() {
    unimplementedWarning("getregion");
    return;
  }

  getargbvalue(x: number, y: number, channel: number) {
    unimplementedWarning("getargbvalue");
    return;
  }
}

export default Map;
