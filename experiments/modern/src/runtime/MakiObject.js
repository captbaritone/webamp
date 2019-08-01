const Emitter = require("../Emitter");

class MakiObject {
  constructor(node, parent) {
    this.xmlNode = node;
    this.parent = parent;
    this.children = [];
    this._emitter = new Emitter();
  }

  addChild(child) {
    this.children.push(child);
  }

  addChildren(children) {
    this.children = this.children.concat(children);
  }

  js_trigger(eventName, ...args) {
    this._emitter.trigger(eventName, args);
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
