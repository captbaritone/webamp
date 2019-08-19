import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Vis extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Vis";
  }

  setmode(mode) {
    unimplementedWarning("setmode");
  }
}

export default Vis;
