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

  leftclick() {
    this.js_trigger("onLeftClick");
  }

  rightclick() {
    this.js_trigger("onRightClick");
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

  onleftclick() {
    unimplementedWarning("onleftclick");
    return;
  }

  onrightclick() {
    unimplementedWarning("onrightclick");
    return;
  }

  setactivatednocallback(onoff) {
    unimplementedWarning("setactivatednocallback");
    return;
  }
}

export default Button;
