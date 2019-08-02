const Emitter = require("../Emitter");

class MakiObject {
  constructor(node, parent) {
    this.xmlNode = node;
    this.parent = parent;
    this.children = [];
    this.hooks = {};
    this._emitter = new Emitter();

    if (!this.xmlNode) {
      // When dynamically creating a new object with `new` we need to add an underlying "XML"
      // node that we can edit
      this.xmlNode = {
        children: [],
        attributes: {
          id: null,
        },
        // ugly but works for now
        name: this.constructor.name.toLowerCase(),
        type: 'element'
      }
    }
  }

  js_addChild(child) {
    this.children.push(child);
  }

  js_addChildren(children) {
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

  // updating hooks like this is probably totally wrong, but just hacking for now
  js_updateHooks (node, hooks) {
    this.hooks[node] = hooks;
  }

  js_getActiveHooks () {
    const hookArrs = Object.values(this.hooks);
    return hookArrs.reduce((acc, val) => acc.concat(val), []);
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
