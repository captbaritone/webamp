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
    return Number(this.attributes.h) || 0;
  }

  getwidth() {
    return Number(this.attributes.w) || 0;
  }

  resize(x, y, w, h) {
    this.attributes.x = x;
    this.attributes.y = y;
    this.attributes.w = w;
    this.attributes.h = h;
    // TODO: Confirm that GuiObject actually supports these min/max attributes
    this.attributes.minimum_w = w;
    this.attributes.maximum_w = w;
    this.attributes.minimum_h = h;
    this.attributes.maximum_h = h;
  }
}

export default GuiObject;
