import * as Utils from "../utils";
import UI_ROOT from "../UIRoot";
import GuiObj from "./GuiObj";
import SystemObject from "./SystemObject";

export default class Group extends GuiObj {
  _background: string;
  _desktopAlpha: boolean;
  _drawBackground: boolean;
  _minimumHeight: number;
  _maximumHeight: number;
  _minimumWidth: number;
  _maximumWidth: number;
  _systemObjects: SystemObject[] = [];
  _children: GuiObj[] = [];

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "background":
        this._background = value;
        break;
      case "drawbackground":
        this._drawBackground = Utils.toBool(value);
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

  addSystemObject(systemObj: SystemObject) {
    systemObj.setParentGroup(this);
    this._systemObjects.push(systemObj);
  }

  addChild(child: GuiObj) {
    this._children.push(child);
  }

  getDebugDom(): HTMLDivElement {
    const div = super.getDebugDom();
    div.style.height = Utils.px(this._maximumHeight);
    div.style.width = Utils.px(this._maximumWidth);
    if (this._background != null && this._drawBackground) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      div.style.background = bitmap.getBackgrondCSSAttribute();
    }
    for (const child of this._children) {
      div.appendChild(child.getDebugDom());
    }
    return div;
  }
}
