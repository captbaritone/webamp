const GuiObject = require("./GuiObject");

class Group extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "Group";
  }
  findObject(id) {
    throw new Error("Not implemented");
  }
  setXmlParam(id, value) {
    throw new Error("Not implemented");
  }
}

module.exports = Group;
