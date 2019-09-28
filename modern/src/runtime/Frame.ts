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

  getposition() {
    Utils.unimplementedWarning("getposition");
    return;
  }

  setposition(position: number) {
    Utils.unimplementedWarning("setposition");
    return;
  }

  onsetposition(position: number) {
    Utils.unimplementedWarning("onsetposition");
    return;
  }
}
