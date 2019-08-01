const GuiObject = require("./GuiObject");

class Container extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "Container";
  }
  getLayout(id) {
    return null;
  }
}

module.exports = Container;
