import Emitter from "../Emitter";
import * as Utils from "../utils";
import { ModernStore, ResolvedXmlNode } from "../types";

class MakiObject {
  name: string;
  _uid: number;
  _store: ModernStore;
  attributes: Object;
  parent: MakiObject;
  _emitter: Emitter;
  children: MakiObject[];
  js_annotations: Object;

  constructor(
    node: ResolvedXmlNode,
    parent: MakiObject,
    annotations: Object = {},
    store: ModernStore
  ) {
    this._store = store;
    if (node) {
      this._uid = node.uid;
      this.attributes = node.attributes || {};
      this.name = node.name;
    } else {
      this._uid = Utils.getId();
      // When dynamically creating an object with `new` we have no underlying node
      this.attributes = {};
      this.name = this.getclassname().toLowerCase();
    }
    this.parent = parent;
    this.js_annotations = annotations;
    this.children = [];
    this._emitter = new Emitter();
  }

  js_addChild(child: MakiObject) {
    this.children.push(child);
  }

  js_addChildren(children: MakiObject[]) {
    this.children = this.children.concat(children);
  }

  js_removeChild(child: MakiObject) {
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

  js_imageLookup(id: string) {
    const element = Utils.findElementById(this, id);
    if (element) {
      return element.js_annotations;
    }

    return null;
  }

  js_groupdefLookup(id: string) {
    const groupdef = Utils.findGroupDefById(this, id);
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

  onnotify(command: string, param: string, a: number, b: number): number {
    this.js_trigger("onNotify", command, param, a, b);
    return 0;
  }
}

export default MakiObject;
