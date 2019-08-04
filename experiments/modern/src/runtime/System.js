import Group from "./Group";
import MakiObject from "./MakiObject";
import { findDescendantByTypeAndId, unimplementedWarning } from "../utils";

class System extends MakiObject {
  constructor(scriptGroup = new Group()) {
    super(null, null);

    this.scriptGroup = scriptGroup;
    this.root = scriptGroup;
    while (this.root.parent) {
      this.root = this.root.parent;
    }
  }

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassaname() {
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
    unimplementedWarning("gettoken");
    return "Some Token String";
  }
  getparam() {
    unimplementedWarning("getparam");
    return "Some String";
  }
  messagebox(message, msgtitle, flag, notanymoreId) {
    console.log({ message, msgtitle, flag, notanymoreId });
  }
  integertostring(value) {
    return value.toString();
  }
  getprivateint(section, item, defvalue) {
    unimplementedWarning("getprivateint");
    return defvalue;
  }
  setprivateint(section, item, defvalue) {
    unimplementedWarning("setprivateint");
  }
  getleftvumeter() {
    unimplementedWarning("getleftvumeter");
    return 0.5;
  }
  getrightvumeter() {
    unimplementedWarning("getrightvumeter");
    return 0.5;
  }
  getvolume() {
    unimplementedWarning("getvolume");
    return 1;
  }
  getplayitemlength() {
    unimplementedWarning("getplayitemlength");
    return 100000;
  }
  seekto(pos) {
    unimplementedWarning("seekto");
  }
}

export default System;
