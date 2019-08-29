import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class List extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "List";
  }

  additem(_object) {
    unimplementedWarning("additem");
    return;
  }

  removeitem(pos: number) {
    unimplementedWarning("removeitem");
    return;
  }

  enumitem(pos: number) {
    unimplementedWarning("enumitem");
    return;
  }

  finditem(_object) {
    unimplementedWarning("finditem");
    return;
  }

  getnumitems() {
    unimplementedWarning("getnumitems");
    return;
  }

  removeall() {
    unimplementedWarning("removeall");
    return;
  }
}

export default List;
