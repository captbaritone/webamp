const MakiObject = require("./MakiObject");

class JsElements extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getclassname() {
    return "Elements";
  }
}

module.exports = JsElements;
