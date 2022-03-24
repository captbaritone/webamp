import GuiObj from "./GuiObj";
import UI_ROOT from "../../UIRoot";
import Group from "./Group";
import { toBool } from "../../utils";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Ccomponentbucket.2F.3E
export default class ComponentBucket extends Group {
  static GUID = "97aa3e4d4fa8f4d0f20a7b818349452a";
  _wndType: string;
  _vertical: boolean = false; // default horizontal
  _wrapper: HTMLElement;

  constructor() {
    super()
    this._wrapper = document.createElement('wrapper')
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }

    switch (key.toLowerCase()) {
      case "wndtype":
        this._wndType = value.toLowerCase();
        break;
      case "vertical":
        this._vertical = toBool(value);
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

  appendChildrenDiv() {
    // ComponentBucket wraps its children in a div to be scrollable
    this._div.appendChild(this._wrapper)
    this._appendChildrenToDiv(this._wrapper);
  }

  draw() {
    super.draw();
    if (this._vertical) {
      this._div.classList.add("vertical");
    } else {
      this._div.classList.remove("vertical");
    }
  }
}
