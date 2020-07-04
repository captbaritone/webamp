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

  getcurpage(): number {
    return unimplementedWarning("getcurpage");
  }

  setcurpage(a: number): void {
    return unimplementedWarning("setcurpage");
  }
}

export default TabSheet;
