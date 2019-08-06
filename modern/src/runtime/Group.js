import GuiObject from "./GuiObject";

class Group extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Group";
  }

  getobject(id) {
    // Not sure this is correct, but it is my understanding this is just an alias
    return this.findobject(id);
  }
}

export default Group;
