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
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getclassname() {
    return "System";
  }

  js_start() {
    this.js_trigger("onScriptLoaded");
  }

  getscriptgroup() {
    return this.scriptGroup;
  }
  getcontainer(id) {
    return findDescendantByTypeAndId(this.root, "container", id);
  }
  getruntimeversion() {
    return "5.666";
  }
  gettoken(str, separator, tokennum) {
    return "Some Token String";
  }
  getparam() {
    return "Some String";
  }
  messagebox(message, msgtitle, flag, notanymoreId) {
    console.log({ message, msgtitle, flag, notanymoreId });
  }
}

module.exports = System;
