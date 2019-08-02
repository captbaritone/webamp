const GuiObject = require("./GuiObject");

class Status extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "Status";
  }
}

module.exports = Status;
