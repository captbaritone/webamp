const GuiObject = require("./GuiObject");

class Text extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "Text";
  }
}

module.exports = Text;
