import GuiObject from "./GuiObject";
import { findDescendantByTypeAndId } from "../utils";

class Container extends GuiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Container";
  }

  getlayout(id) {
    return findDescendantByTypeAndId(this, "layout", id);
  }
}

export default Container;
