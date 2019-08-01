const GuiObject = require("./GuiObject");

class Button extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "Button";
  }
}

module.exports = Button;
