const Group = require("./Group");
const MakiObject = require("./MakiObject");
const { findDescendantByTypeAndId } = require("../utils");

class System extends MakiObject {
  constructor(scriptGroup = new Group()) {
    super(null, null);

    this.scriptGroup = scriptGroup;
    this.root = scriptGroup;
    while(this.root.parent) {
      this.root = this.root.parent;
    }
  }

  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "System";
  }

  js_start() {
    this.js_trigger("onScriptLoaded");
  }

  getScriptGroup() {
    return this.scriptGroup;
  }
  getContainer(id) {
    return findDescendantByTypeAndId(this.root, "container", id);
  }
  getRuntimeVersion() {
    return "5.666";
  }
  getToken(str, separator, tokennum) {
    return "Some Token String";
  }
  getParam() {
    return "Some String";
  }
  messageBox(message, msgtitle, flag, notanymoreId) {
    console.log({ message, msgtitle, flag, notanymoreId });
  }
}

module.exports = System;
