import GuiObject from "./GuiObject";
import * as Selectors from "../Selectors";
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

  oncreateobject(newobj) {
    unimplementedWarning("oncreateobject");
    return;
  }

  getmouseposx(): number {
    return Selectors.getMousePosition(this._store.getState()).x;
  }

  getmouseposy(): number {
    return Selectors.getMousePosition(this._store.getState()).y;
  }

  islayout() {
    unimplementedWarning("islayout");
    return;
  }
}

export default Group;
