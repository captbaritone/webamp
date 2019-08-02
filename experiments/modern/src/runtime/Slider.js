const GuiObject = require("./GuiObject");

class Slider extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "Slider";
  }
}

module.exports = Slider;
