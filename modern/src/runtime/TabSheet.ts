import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class TabSheet extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "TabSheet";
  }

  getcurpage() {
    unimplementedWarning("getcurpage");
    return;
  }

  setcurpage(a) {
    unimplementedWarning("setcurpage");
    return;
  }
}

export default TabSheet;
