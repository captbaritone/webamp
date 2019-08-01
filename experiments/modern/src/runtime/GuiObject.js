const MakiObject = require("./MakiObject");

class GuiObject extends MakiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "GuiObject";
  }
  findObject(id) {
    return this.findDescendantByTypeAndId(this, null, id);
  }
}

module.exports = GuiObject;
