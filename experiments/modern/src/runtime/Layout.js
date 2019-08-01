const GuiObject = require("./GuiObject");
const { findParentNodeOfType } = require("../utils");

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
    return findParentNodeOfType(this, ["container"]);;
  }
}

module.exports = Layout;
