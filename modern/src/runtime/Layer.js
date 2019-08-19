import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Layer extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Layer";
  }

  setregion(reg) {
    unimplementedWarning("setregion");
  }

  setregionfrommap(regionmap, threshold, reverse) {
    unimplementedWarning("setregion");
  }
}

export default Layer;
