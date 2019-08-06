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
    this.xmlNode.attributes.x = x;
    this.xmlNode.attributes.y = y;
    this.xmlNode.attributes.minimum_w = w;
    this.xmlNode.attributes.maximum_w = w;
    this.xmlNode.attributes.minimum_h = h;
    this.xmlNode.attributes.maximum_h = h;
  }
}

export default Layout;
