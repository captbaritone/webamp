import GuiObject from "./GuiObject";
import { findParentNodeOfType } from "../utils";

class Layout extends GuiObject {
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
    return findParentNodeOfType(this, ["container"]);
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
