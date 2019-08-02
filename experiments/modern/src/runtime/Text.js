const GuiObject = require("./GuiObject");

class Text extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getclassname() {
    return "Text";
  }
}

module.exports = Text;
