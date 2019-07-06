const Group = require("./Group");
const MakiObject = require("./MakiObject");

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

  constructor() {
    super();
    this._onScriptLoadedCallbacks = [];
    this._onSetXuiParamCallbacks = [];
  }

  _start() {
    this._onScriptLoadedCallbacks.forEach(cb => {
      cb();
    });
  }
  onScriptLoaded(cb) {
    this._onScriptLoadedCallbacks.push(cb);
  }
  onSetXuiParam(cb) {
    this._onSetXuiParamCallbacks.push(cb);
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
  messageBox(message, msgtitle, flag, notanymoreId) {
    console.log({ message, msgtitle, flag, notanymoreId });
  }
}

module.exports = System;
