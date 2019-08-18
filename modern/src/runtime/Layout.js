import Group from "./Group";
import { findParentNodeOfType } from "../utils";

class Layout extends Group {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Layout";
  }

  getcontainer() {
    return findParentNodeOfType(this, new Set(["container"]));
  }
}

export default Layout;
