const MakiObject = require("./MakiObject");
const { findDescendantByTypeAndId } = require("../utils");

class GuiObject extends MakiObject {
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
}

module.exports = GuiObject;
