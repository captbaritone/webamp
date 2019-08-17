import MakiObject from "./MakiObject";
import { findDescendantByTypeAndId } from "../utils";

class Container extends MakiObject {
  constructor(node, parent) {
    super(node, parent);

    this.visible = true;
  }

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Container";
  }

  show() {
    this.visible = true;
    this.parent.js_trigger("js_update");
  }

  hide() {
    this.visible = false;
    this.parent.js_trigger("js_update");
  }

  getlayout(id) {
    return findDescendantByTypeAndId(this, "layout", id);
  }
}

export default Container;
