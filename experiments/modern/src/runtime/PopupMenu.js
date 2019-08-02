const GuiObject = require("./GuiObject");

class PopupMenu extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "PopupMenu";
  }
  addCommand(txt, id, checked, disabled) {
  }
  addSeparator() {

  }
  // checkCommand(id, check) {}
  // popAtMouse() {}
}

module.exports = PopupMenu;
