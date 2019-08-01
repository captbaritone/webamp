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
  getObject(id) {
    // Not sure this is correct, but it is my understanding this is just an alias
    return this.findObject(id);
  }
}

module.exports = Group;
