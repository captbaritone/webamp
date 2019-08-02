const GuiObject = require("./GuiObject");
const { findParentNodeOfType } = require("../utils");

class Layout extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getclassname() {
    return "Layout";
  }
  getcontainer() {
    return findParentNodeOfType(this, ["container"]);;
  }
}

module.exports = Layout;
