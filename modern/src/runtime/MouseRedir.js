import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class MouseRedir extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "MouseRedir";
  }

  setredirection(o) {
    unimplementedWarning("setredirection");
    return;
  }

  getredirection() {
    unimplementedWarning("getredirection");
    return;
  }

  setregionfrommap(regionmap, threshold, reverse) {
    unimplementedWarning("setregionfrommap");
    return;
  }

  setregion(reg) {
    unimplementedWarning("setregion");
    return;
  }
}

export default MouseRedir;
