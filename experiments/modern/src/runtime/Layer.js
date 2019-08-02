const GuiObject = require("./GuiObject");

class Layer extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getclassname() {
    return "Layer";
  }
}

module.exports = Layer;
