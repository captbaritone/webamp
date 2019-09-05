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

  leftclick(): void {
    this.js_trigger("onLeftClick");
  }

  rightclick(): void {
    this.js_trigger("onRightClick");
  }

  onactivate(activated: number) {
    unimplementedWarning("onactivate");
  }

  setactivated(onoff: boolean) {
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

  setactivatednocallback(onoff: boolean) {
    unimplementedWarning("setactivatednocallback");
    return;
  }
}

export default Button;
