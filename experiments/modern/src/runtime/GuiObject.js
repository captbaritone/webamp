const MakiObject = require("./MakiObject");
const { findDescendantByTypeAndId } = require("../utils");

class GuiObject extends MakiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "GuiObject";
  }
  findObject(id) {
    return findDescendantByTypeAndId(this, null, id);
  }
  init(newRoot) {
    newRoot.js_addChild(this);
    return this;
  }
  setXmlParam(param, value) {
    this.xmlNode.attributes[param] = value;
    return value;
  }
  // need to force all function names to lowercase in the interpreter
  // bad hack for now
  setXMLParam(param, value) {
    return this.setXmlParam(param, value);
  }
  getXmlParam(param) {
    const attributes = this.xmlNode.attributes;
    if (attributes !== undefined && attributes.hasOwnProperty(param)) {
      return attributes[param];
    }
    return null;
  }
  getParent() {
    return this.parent;
  }
}

module.exports = GuiObject;
