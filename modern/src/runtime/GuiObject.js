import MakiObject from "./MakiObject";
import { findDescendantByTypeAndId, unimplementedWarning } from "../utils";

class GuiObject extends MakiObject {
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
    return "GuiObject";
  }

  findobject(id) {
    return findDescendantByTypeAndId(this, null, id);
  }

  getobject(id) {
    // Not sure this is correct, but it is my understanding this is just an alias
    return this.findobject(id);
  }

  init(newRoot) {
    this.parent = newRoot;
    newRoot.js_addChild(this);
    return this;
  }

  setxmlparam(param, value) {
    this.attributes[param] = value;
    return value;
  }

  getxmlparam(param) {
    const attributes = this.attributes;
    if (attributes !== undefined && attributes.hasOwnProperty(param)) {
      return attributes[param];
    }
    return null;
  }

  getparent() {
    return this.parent;
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  gettop() {
    if (this.attributes) {
      return this.attributes.y || 0;
    }
    return 0;
  }

  getleft() {
    if (this.attributes) {
      return this.attributes.x || 0;
    }
    return 0;
  }

  getheight() {
    if (this.attributes) {
      return this.attributes.h || 0;
    }
    return 0;
  }

  getwidth() {
    if (this.attributes) {
      return this.attributes.w || 0;
    }
    return 0;
  }

  resize(x, y, w, h) {
    this.attributes.x = x;
    this.attributes.y = y;
    this.attributes.w = w;
    this.attributes.h = h;
  }
}

export default GuiObject;
