import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class ComponentBucket extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "ComponentBucket";
  }

  getmaxheight() {
    unimplementedWarning("getmaxheight");
    return;
  }

  getmaxwidth() {
    unimplementedWarning("getmaxwidth");
    return;
  }

  setscroll(x: number) {
    unimplementedWarning("setscroll");
    return;
  }

  getscroll() {
    unimplementedWarning("getscroll");
    return;
  }

  getnumchildren() {
    unimplementedWarning("getnumchildren");
    return;
  }

  enumchildren(n: number) {
    unimplementedWarning("enumchildren");
    return;
  }
}

export default ComponentBucket;
