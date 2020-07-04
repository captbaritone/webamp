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

  onactivate(activated: number): void {
    this.js_trigger("onActivate", activated);
  }

  setactivated(onoff: boolean): void {
    return unimplementedWarning("setactivated");
  }

  getactivated(): boolean {
    unimplementedWarning("getactivated");
    return false;
  }

  onleftclick(): void {
    this.js_trigger("onLeftClick");
  }

  onrightclick(): void {
    this.js_trigger("onRightClick");
  }

  setactivatednocallback(onoff: boolean): void {
    return unimplementedWarning("setactivatednocallback");
  }
}

export default Button;
