import GuiObj from "./GuiObj";
import UI_ROOT from "../../UIRoot";
import Group from "./Group";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Ccomponentbucket.2F.3E
export default class ComponentBucket extends Group {
  static GUID = "97aa3e4d4fa8f4d0f20a7b818349452a";
  _wndType: string;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key.toLowerCase()) {
      case "wndtype":
        this._wndType = value.toLowerCase();
        break;
      default:
        return false;
    }
    return true;
  }

  getWindowType(): string {
    return this._wndType;
  }

  getmaxheight(): number {
    return this._maximumHeight;
  }
  getmaxwidth(): number {
    return this._maximumWidth;
  }

  setscroll(x: number): number {
    return 10; //TODO setscroll to ._div
  }

  getscroll(): number {
    return 10; //TODO: Check by ._div.scroll
  }

  getnumchildren(): number {
    return this._children.length;
  }

  enumchildren(n: number): GuiObj {
    return this._children[n];
  }
}
