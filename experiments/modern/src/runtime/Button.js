const GuiObject = require("./GuiObject");

class Button extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Button";
  }
}

module.exports = Button;
