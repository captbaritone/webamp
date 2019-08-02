const GuiObject = require("./GuiObject");

class Group extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getclassname() {
    return "Group";
  }
  getobject(id) {
    // Not sure this is correct, but it is my understanding this is just an alias
    return this.findobject(id);
  }
}

module.exports = Group;
