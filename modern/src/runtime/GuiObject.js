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
    this.js_trigger("js_update");
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
    this.parent.js_trigger("js_update");
  }

  hide() {
    this.visible = false;
    this.parent.js_trigger("js_update");
  }

  gettop() {
    return Number(this.attributes.y) || 0;
  }

  getleft() {
    return Number(this.attributes.x) || 0;
  }

  getheight() {
    // TODO
    // I don't know how it gets calculated exactly, but if a node has a minimum
    // and maximum h, but no h, getwidth still returns a value, return min for now
    return Number(this.attributes.h) || Number(this.attributes.minimum_h) || 0;
  }

  getwidth() {
    // TODO
    // I don't know how it gets calculated exactly, but if a node has a minimum
    // and maximum w, but no w, getwidth still returns a value, return min for now
    return Number(this.attributes.w) || Number(this.attributes.minimum_w) || 0;
  }

  resize(x, y, w, h) {
    this.attributes.x = x;
    this.attributes.y = y;
    this.attributes.w = w;
    this.attributes.h = h;
  }
}

export default GuiObject;
