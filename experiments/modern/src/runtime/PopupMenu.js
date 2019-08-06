import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class PopupMenu extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "PopupMenu";
  }
  addcommand(txt, id, checked, disabled) {
    unimplementedWarning("addcommand");
  }
  addseparator() {
    unimplementedWarning("addseparator");
  }
  checkcommand(id, check) {
    unimplementedWarning("checkcommand");
  }
  popatmouse() {
    unimplementedWarning("popatmouse");
  }
}

export default PopupMenu;
