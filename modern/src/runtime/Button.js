import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Button extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Button";
  }

  onactivate(activated) {
    unimplementedWarning("onactivate");
  }

  setactivated(onoff) {
    unimplementedWarning("setactivated");
  }

  getactivated() {
    unimplementedWarning("getactivated");
    return false;
  }
}

export default Button;
