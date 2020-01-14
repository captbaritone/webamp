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

  getmaxheight(): number {
    return unimplementedWarning("getmaxheight");
  }

  getmaxwidth(): number {
    return unimplementedWarning("getmaxwidth");
  }

  setscroll(x: number): number {
    return unimplementedWarning("setscroll");
  }

  getscroll(): number {
    return unimplementedWarning("getscroll");
  }

  getnumchildren(): number {
    return unimplementedWarning("getnumchildren");
  }

  enumchildren(n: number) {
    return unimplementedWarning("enumchildren");
  }
}

export default ComponentBucket;
