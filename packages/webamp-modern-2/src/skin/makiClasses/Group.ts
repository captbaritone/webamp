import * as Utils from "../../utils";
import UI_ROOT from "../../UIRoot";
import GuiObj from "./GuiObj";
import SystemObject from "./SystemObject";
import Movable from "./Movable";
import Layout from "./Layout";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cgroup.2F.3E
export default class Group extends Movable {
  static GUID = "45be95e5419120725fbb5c93fd17f1f9";
  _parent: Group;
  _instanceId: string;
  _background: string;
  _desktopAlpha: boolean;
  _drawBackground: boolean = true;
  _isLayout: boolean = false;
  _systemObjects: SystemObject[] = [];
  

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "instance_id":
        this._instanceId = value;
        break;
      case "background":
        this._background = value;
        this._renderBackground();
        break;
      case "drawbackground":
        this._drawBackground = Utils.toBool(value);
        this._renderBackground();
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    for (const systemObject of this._systemObjects) {
      systemObject.init();
    }
    for (const child of this._children) {
      child.init();
    }
  }

  getId() {
    return this._instanceId || this._id;
  }

  addSystemObject(systemObj: SystemObject) {
    systemObj.setParentGroup(this);
    this._systemObjects.push(systemObj);
  }

  addChild(child: GuiObj) {
    child.setParent(this);
    this._children.push(child);
  }

  findobject(objectId: string): GuiObj | null {
    const lower = objectId.toLowerCase();
    for (const obj of this._children) {
      if (obj.getId() === lower) {
        return obj;
      }
      if (obj instanceof Group) {
        const found = obj.findobject(objectId);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  /* Required for Maki */
  getobject(objectId: string): GuiObj {
    const lower = objectId.toLowerCase();
    for (const obj of this._children) {
      if (obj.getId() === lower) {
        return obj;
      }
    }
    const foundIds = this._children.map((child) => child.getId()).join(", ");
    throw new Error(
      `Could not find an object with the id: "${objectId}" within object "${this.getId()}". Only found: ${foundIds}`
    );
  }

  getparentlayout(): Layout {
    let obj: Group = this;
    while (obj._parent) {
      if (obj._isLayout) {
        break;
      }
      obj = obj._parent;
    }
    if (!obj) {
      console.warn("getParentLayout", this.getId(), "failed!");
    }
    return obj as Layout;
  }

  // This shadows `getheight()` on GuiObj
  getheight(): number {
    const h = super.getheight();
    if (h == null && this._background != null) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      if (bitmap) return bitmap.getHeight();
    }
    return h ?? 0;
  }

  // This shadows `getwidth()` on GuiObj
  getwidth(): number {
    const w = super.getwidth();
    if (w == null && this._background != null) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      if (bitmap) return bitmap.getWidth();
    }
    return w ?? 0;
  }

  _renderBackground() {
    if (this._background != null && this._drawBackground) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      this.setBackgroundImage(bitmap);
    } else {
      this.setBackgroundImage(null);
    }
  }

  doResize() {
    super.doResize();
    this._regionCanvas=null;
    //this.applyRegions();
    for (const child of this._children) {
      child.doResize()
    }
  }

  
  draw() {
    super.draw();
    this._div.classList.add("webamp--img");
    // It seems Groups are not responsive to click events.
    if (this._movable || this._resizable) {
      // this._div.style.removeProperty('pointer-events');
      this._div.style.pointerEvents = "auto";
    } else {
      this._div.style.pointerEvents = "none";
    }
    //TODO: allow move/resize if has ._image
    this._div.style.pointerEvents = "none";
    // this._div.style.overflow = "hidden";
    this._renderBackground();
    for (const child of this._children) {
      child.draw();
      this._div.appendChild(child.getDiv());
    }
  }
}
