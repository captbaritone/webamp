const MakiObject = require("./MakiObject");
const { findDescendantByTypeAndId } = require("../utils");

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
  static getclassname() {
    return "GuiObject";
  }
  findobject(id) {
    return findDescendantByTypeAndId(this, null, id);
  }
  getObject(id) {
    // Not sure this is correct, but it is my understanding this is just an alias
    return this.findObject(id);
  }
  init(newRoot) {
    newRoot.js_addChild(this);
    return this;
  }
  setxmlparam(param, value) {
    this.xmlNode.attributes[param] = value;
    return value;
  }
  getxmlparam(param) {
    const attributes = this.xmlNode.attributes;
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
    return 5;
  }

  getheight() {
    return 100;
  }

  getwidth() {
    return 100;
  }

  resize(x, y, w, h) {
    this.xmlNode.attributes.x = x;
    this.xmlNode.attributes.y = y;
    this.xmlNode.attributes.w = w;
    this.xmlNode.attributes.h = h;
  }
}

module.exports = GuiObject;
