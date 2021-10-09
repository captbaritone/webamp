import * as Utils from "../../utils";
import UI_ROOT from "../../UIRoot";
import GuiObj from "./GuiObj";
import SystemObject from "./SystemObject";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cgroup.2F.3E
export default class Group extends GuiObj {
  static GUID = "45be95e5419120725fbb5c93fd17f1f9";
  _parent: Group;
  _instanceId: string;
  _background: string;
  _desktopAlpha: boolean;
  _drawBackground: boolean = true;
  _minimumHeight: number;
  _maximumHeight: number;
  _minimumWidth: number;
  _maximumWidth: number;
  _systemObjects: SystemObject[] = [];
  _children: GuiObj[] = [];

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
      case "minimum_h":
        this._minimumHeight = Utils.num(value);
        break;
      case "minimum_w":
        this._minimumWidth = Utils.num(value);
        break;
      case "maximum_h":
        this._maximumHeight = Utils.num(value);
        break;
      case "maximum_w":
        this._maximumWidth = Utils.num(value);
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

  // This shadows `getheight()` on GuiObj
  getheight(): number {
    if (this._height) {
      return this._height;
    }
    if (this._background != null) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      return bitmap.getHeight();
    }
    return super.getheight();
  }

  // This shadows `getwidth()` on GuiObj
  getwidth(): number {
    if (this._width) {
      return this._width;
    }
    if (this._background != null) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      return bitmap.getWidth();
    }
    return super.getwidth();
  }

  _renderBackground() {
    if (this._background != null && this._drawBackground) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      this.setBackgroundImage(bitmap);
    } else {
      this.setBackgroundImage(null);
    }
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "Group");
    this._div.classList.add("webamp--img");
    // It seems Groups are not responsive to click events.
    this._div.style.pointerEvents = "none";
    this._div.style.overflow = "hidden";
    this._div.style.height = Utils.px(this._maximumHeight);
    this._div.style.width = Utils.px(this._maximumWidth);
    this._renderBackground();
    for (const child of this._children) {
      child.draw();
      this._div.appendChild(child.getDiv());
    }
  }
}
