import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class Region extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Region";
  }

  loadfrommap(regionmap, threshold, reversed) {
    unimplementedWarning("loadFromMap");
  }

  offset(x, y) {
    unimplementedWarning("offset");
  }
}

export default Region;
