const Group = require("./Group");
const MakiObject = require("./MakiObject");

const onScriptLoadedCallbacks = [];
const onSetXuiParamCallbacks = [];

class System extends MakiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "System";
  }

  _start() {
    onScriptLoadedCallbacks.forEach(cb => {
      cb();
    });
  }
  onScriptLoaded(cb) {
    onScriptLoadedCallbacks.push(cb);
  }
  onSetXuiParam(cb) {
    onSetXuiParamCallbacks.push(cb);
  }
  getScriptGroup() {
    return new Group();
  }
  getToken(str, separator, tokennum) {
    return "Some Token String";
  }
  getParam() {
    return "Some String";
  }
  messagebox(message, var2, var3, var4) {
    alert(message);
  }
}

module.exports = System;
