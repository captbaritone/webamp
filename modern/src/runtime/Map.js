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

  loadmap(bitmapid) {
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
}

export default Map;
