import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Text extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Text";
  }

  setalternatetext(txt) {
    unimplementedWarning("setalternatetext");
  }
}

export default Text;
