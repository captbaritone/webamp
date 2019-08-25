import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class QueryList extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "QueryList";
  }

  onresetquery() {
    unimplementedWarning("onresetquery");
    return;
  }
}

export default QueryList;
