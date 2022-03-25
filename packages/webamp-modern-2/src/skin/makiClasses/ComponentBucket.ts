import GuiObj from "./GuiObj";
import UI_ROOT from "../../UIRoot";
import Group from "./Group";
import { px, toBool } from "../../utils";
import Button from "./Button";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Ccomponentbucket.2F.3E
export default class ComponentBucket extends Group {
  static GUID = "97aa3e4d4fa8f4d0f20a7b818349452a";
  _wndType: string;
  _vertical: boolean = false; // default horizontal
  _wrapper: HTMLElement;
  _page: number = 0;

  constructor() {
    super();
    this._wrapper = document.createElement("wrapper");
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

  handleAction(
    action: string,
    param: string | null = null,
    actionTarget: string | null = null
  ) {
    switch (action.toLowerCase()) {
      case "cb_prev":
      case "cb_prevpage":
        this._scrollPage(1);
        return true;
      case "cb_next":
      case "cb_nextpage":
        this._scrollPage(-1);
        return true;
    }
    return false;
  }

  init() {
    this.resolveButtonsAction();
    super.init();
  }
  resolveButtonsAction() {
    for (const obj of this.getparent()._children) {
      if (
        obj instanceof Button &&
        (obj._actionTarget == null || obj._actionTarget == "bucket") && 
        (obj._action && obj._action.startsWith('cb_'))
      ) {
        obj._actionTarget = this.getId()
      }
    }
  }

  _scrollPage(step: 1 | -1) {
    if (!this._children.length) return;
    const oneChild = this._children[0];
    const oneStep = this._vertical ? oneChild.getheight() : oneChild.getwidth();
    const anchor = this._vertical ? "top" : "left";
    const currentStep = this._vertical? this._wrapper.offsetTop : this._wrapper.offsetLeft;
    //TODO: Clamp to not over top nor over left (showing empty space bug)
    this._wrapper.style.setProperty(anchor, px(currentStep + oneStep * step));
  }

  appendChildrenDiv() {
    // ComponentBucket wraps its children in a div to be scrollable
    this._div.appendChild(this._wrapper);
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
