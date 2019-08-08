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
    return this.attributes[param];
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
    return this.attributes.y || 0;
  }

  getleft() {
    return this.attributes.x || 0;
  }

  getheight() {
    return this.attributes.h || 0;
  }

  getwidth() {
    return this.attributes.w || 0;
  }

  resize(x, y, w, h) {
    this.attributes.x = x;
    this.attributes.y = y;
    this.attributes.w = w;
    this.attributes.h = h;
  }
}

export default GuiObject;
