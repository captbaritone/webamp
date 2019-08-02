const GuiObject = require("./GuiObject");

class Layer extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "Layer";
  }
}

module.exports = Layer;
