import * as Utils from "../utils";
import XmlObj from "./XmlObj";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#GuiObject_.28Global_params.29
export default class GuiObj extends XmlObj {
  _id: string;
  _width: number;
  _height: number;
  _x: number = 0;
  _y: number = 0;
  _droptarget: string;
  _visible: boolean = true;

  setXmlAttr(key: string, value: string): boolean {
    switch (key) {
      case "id":
        this._id = value;
        break;
      case "w":
        this._width = Utils.num(value);
        break;
      case "h":
        this._height = Utils.num(value);
        break;
      case "x":
        this._x = Utils.num(value) ?? 0;
        break;
      case "y":
        this._y = Utils.num(value) ?? 0;
        break;
      case "droptarget":
        this._droptarget = value;
        break;
      case "visible":
        this._visible = Utils.toBool(value);
        break;
      default:
        return false;
    }
    return true;
  }

  init() {
    // pass
  }

  getDebugDom(): HTMLDivElement {
    const div = window.document.createElement("div");
    div.style.display = this._visible ? "inline-block" : "none";
    div.style.position = "absolute";
    if (this._x) {
      div.style.left = Utils.px(this._x);
    }
    if (this._y) {
      div.style.top = Utils.px(this._y);
    }
    if (this._width) {
      div.style.width = Utils.px(this._width);
    }
    if (this._height) {
      div.style.height = Utils.px(this._height);
    }
    return div;
  }
}
