const GuiObject = require("./GuiObject");
const { findDescendantByTypeAndId } = require("../utils");

class Container extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassaname() {
    return "Container";
  }
  getlayout(id) {
    return findDescendantByTypeAndId(this, "layout", id);
  }
}

module.exports = Container;
