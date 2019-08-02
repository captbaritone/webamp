const Button = require("./Button");

class ToggleButton extends Button {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "ToggleButton";
  }
}

module.exports = ToggleButton;
