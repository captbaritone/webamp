const GuiObject = require("./GuiObject");
const { unimplementedWarning } = require("../utils");

class PopupMenu extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassaname() {
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

module.exports = PopupMenu;
