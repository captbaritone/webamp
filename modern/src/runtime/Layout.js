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

  resize(x, y, w, h) {
    this.attributes.x = x;
    this.attributes.y = y;
    this.attributes.minimum_w = w;
    this.attributes.maximum_w = w;
    this.attributes.minimum_h = h;
    this.attributes.maximum_h = h;
  }
}

export default Layout;
