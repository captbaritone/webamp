import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class LayoutStatus extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "LayoutStatus";
  }

  callme(str: string) {
    unimplementedWarning("callme");
    return;
  }
}

export default LayoutStatus;
