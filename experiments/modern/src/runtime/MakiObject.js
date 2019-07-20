const Emitter = require("../Emitter");

class MakiObject {
  constructor() {
    this._emitter = new Emitter();
  }

  async js_trigger(eventName, ...args) {
    // Remove this await when we can run the VM synchronously.
    // See GitHub issue #814
    await this._emitter.trigger(eventName, args);
  }

  js_listenToAll(cb) {
    return this._emitter.listenToAll(cb);
  }

  js_dispose() {
    this._emitter.dispose();
  }

  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  static getClassName() {
    return "Object";
  }

  /**
   * getId()
   */
  getId() {
    throw new Error("getId not implemented");
  }
}

module.exports = MakiObject;
