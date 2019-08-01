const GuiObject = require("./GuiObject");

class Layout extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "Layout";
  }
  getContainer() {
    return null;
  }
}

module.exports = Layout;
