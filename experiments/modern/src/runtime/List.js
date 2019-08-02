const GuiObject = require("./GuiObject");

class List extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getclassname() {
    return "List";
  }
}

module.exports = List;
