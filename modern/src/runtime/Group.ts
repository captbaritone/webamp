import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

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

  getnumobjects() {
    unimplementedWarning("getnumobjects");
    return;
  }

  enumobject(num) {
    unimplementedWarning("enumobject");
    return;
  }

  oncreateobject(newobj) {
    unimplementedWarning("oncreateobject");
    return;
  }

  getmouseposx() {
    unimplementedWarning("getmouseposx");
    return;
  }

  getmouseposy() {
    unimplementedWarning("getmouseposy");
    return;
  }

  islayout() {
    unimplementedWarning("islayout");
    return;
  }
}

export default Group;
