const GuiObject = require("./GuiObject");

class List extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "List";
  }
}

module.exports = List;
