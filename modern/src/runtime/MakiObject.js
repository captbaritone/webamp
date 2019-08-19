import Emitter from "../Emitter";
import {
  findElementById,
  findGroupDefById,
  unimplementedWarning,
} from "../utils";

class MakiObject {
  constructor(node, parent, annotations = {}, store) {
    this._store = store;
    if (node) {
      this.attributes = node.attributes || {};
      this.name = node.name;
    } else {
      // When dynamically creating an object with `new` we have no underlying node
      this.attributes = {};
      this.name = this.getclassname().toLowerCase();
    }
    this.parent = parent;
    this.js_annotations = annotations;
    this.children = [];
    this._emitter = new Emitter();
  }

  js_addChild(child) {
    this.children.push(child);
  }

  js_addChildren(children) {
    this.children = this.children.concat(children);
  }

  js_removeChild(child) {
    this.children = this.children.filter(item => item !== child);
  }

  js_delete() {
    this.parent.js_removeChild(this);
    this.parent.js_trigger("js_update");
  }

  js_trigger(eventName, ...args) {
    this._emitter.trigger(eventName.toLowerCase(), ...args);
  }

  js_listen(eventName, cb) {
    return this._emitter.listen(eventName, cb);
  }

  js_listenToAll(cb) {
    return this._emitter.listenToAll(cb);
  }

  js_dispose() {
    this._emitter.dispose();
  }

  js_imageLookup(id) {
    const element = findElementById(this, id);
    if (element) {
      return element.js_annotations;
    }

    return null;
  }

  js_groupdefLookup(id) {
    const groupdef = findGroupDefById(this, id);
    if (groupdef) {
      return groupdef;
    }

    return null;
  }

  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Object";
  }

  /**
   * getId()
   */
  getid() {
    throw new Error("getId not implemented");
  }

  onnotify(command, param, a, b) {
    unimplementedWarning("onnotify");
    return 0;
  }
}

export default MakiObject;
