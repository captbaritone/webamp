import GuiObject from "./GuiObject";
import { getMousePosition, unimplementedWarning } from "../utils";

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

  getobject(id: string) {
    // Not sure this is correct, but it is my understanding this is just an alias
    return this.findobject(id);
  }

  getnumobjects() {
    unimplementedWarning("getnumobjects");
    return;
  }

  enumobject(num: number) {
    unimplementedWarning("enumobject");
    return;
  }

  oncreateobject(newobj: GuiObject): void {
    this.js_trigger("onCreateObject", newobj);
  }

  getmouseposx(): number {
    return getMousePosition().x;
  }

  getmouseposy(): number {
    return getMousePosition().y;
  }

  islayout() {
    unimplementedWarning("islayout");
    return;
  }
}

export default Group;
