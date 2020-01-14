import GuiObject from "./GuiObject";
import * as Utils from "../utils";

export default class Frame extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Frame";
  }

  getposition(): number {
    return Utils.unimplementedWarning("getposition");
  }

  setposition(position: number): void {
    return Utils.unimplementedWarning("setposition");
  }

  onsetposition(position: number): void {
    return Utils.unimplementedWarning("onsetposition");
  }
}
