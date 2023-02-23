import GuiObj from "./GuiObj";
import { px } from "../../utils";
import { UIRoot } from "../../UIRoot";

// http://wiki.winamp.com/wiki/XML_GUI_Objects
// @ts-ignore In fact Grid has no GUID
export default class Grid extends GuiObj {
  static GUID = "OFFICIALLY-NO-GUID";
  _image: string; // link to Bitmap._id
  _left: HTMLElement;
  _middle: HTMLElement;
  _right: HTMLElement;

  constructor(uiRoot: UIRoot) {
    super(uiRoot);
    this._left = document.createElement("left");
    this._middle = document.createElement("middle");
    this._right = document.createElement("right");
    this._div.appendChild(this._left);
    this._div.appendChild(this._middle);
    this._div.appendChild(this._right);
  }

  setXmlAttr(key: string, value: string): boolean {
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "middle":
        this._setBitmap(this._middle, value);
        break;
      case "left":
        this._setBitmap(this._left, value);
        break;
      case "right":
        this._setBitmap(this._right, value);
        break;
      default:
        return false;
    }
    return true;
  }

  // This shadows `getheight()` on GuiObj
  getheight(): number {
    if (this._h) {
      return this._h;
    }
    if (this._image != null) {
      const bitmap = this._uiRoot.getBitmap(this._image);
      if (bitmap) return bitmap.getHeight();
    }
    return super.getheight();
  }

  // This shadows `getwidth()` on GuiObj
  getwidth(): number {
    if (this._w) {
      return this._w;
    }
    if (this._image != null) {
      const bitmap = this._uiRoot.getBitmap(this._image);
      if (bitmap) return bitmap.getWidth();
    }
    return super.getwidth();
  }

  _renderBackground() {
    const bitmap =
      this._image != null ? this._uiRoot.getBitmap(this._image) : null;
    this.setBackgroundImage(bitmap);
  }

  _setBitmap(element: HTMLElement, bitmap_id: string) {
    const bitmap = this._uiRoot.getBitmap(bitmap_id);
    if (bitmap) {
      bitmap.setAsBackground(element);
      element.style.width = px(bitmap.getWidth());
    }
  }

  draw() {
    super.draw();
    this._div.style.pointerEvents = "none";
    this._div.style.removeProperty("display");
    this._div.classList.add("webamp--img");
    this._renderBackground();
  }

  isinvalid(): boolean {
    return false;
  }
}
