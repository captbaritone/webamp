const MakiObject = require("./MakiObject");

class JsGroupDef extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getclassname() {
    return "GroupDef";
  }
}

module.exports = JsGroupDef;
