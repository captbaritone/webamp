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
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2);
      }, 2000);
    });
  }
}

export default PopupMenu;
