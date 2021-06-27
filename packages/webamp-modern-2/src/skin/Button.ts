import GuiObj from "./GuiObj";
import UI_ROOT from "../UIRoot";
import { px } from "../utils";
import { VM } from "./VM";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cbutton.2F.3E_.26_.3Ctogglebutton.2F.3E
export default class Button extends GuiObj {
  _image: string;
  _downimage: string;
  _active: boolean = false;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "image":
        this._image = value;
        break;
      case "downimage":
        this._downimage = value;
        break;
      default:
        return false;
    }
    return true;
  }

  // This shadows `getheight()` on GuiObj
  getheight(): number {
    if (this._height) {
      return this._height;
    }
    if (this._image != null) {
      const bitmap = UI_ROOT.getBitmap(this._image);
      return bitmap.getHeight();
    }
    return super.getheight();
  }

  // This shadows `getwidth()` on GuiObj
  getwidth(): number {
    if (this._width) {
      return this._width;
    }
    if (this._image != null) {
      const bitmap = UI_ROOT.getBitmap(this._image);
      return bitmap.getWidth();
    }
    return super.getwidth();
  }

  getactivated(): boolean {
    return this._active;
  }
  setactivated(onoff: boolean) {
    const previous = this._active;
    this._active = onoff;
    if (onoff !== previous) {
      VM.dispatch(this, "onactivate", [
        { type: "BOOL", value: this._active ? 0 : 1 },
      ]);
      this._renderBackground();
    }
  }

  _renderBackground() {
    let image = this._image;
    if (this._active && this._downimage) {
      image = this._downimage;
    }
    if (image != null) {
      const bitmap = UI_ROOT.getBitmap(image);
      this._div.style.backgroundImage = bitmap.getBackgrondImageCSSAttribute();
      this._div.style.backgroundPosition = bitmap.getBackgrondPositionCSSAttribute();
      if (this._div.style.width === "" && bitmap.getWidth()) {
        this._div.style.width = px(bitmap.getWidth());
      }
      if (this._div.style.height === "" && bitmap.getHeight()) {
        this._div.style.height = px(bitmap.getHeight());
      }
    }
  }

  _bindToDom() {
    // TODO: Cleanup!
    this._div.addEventListener("mousedown", this._handleMouseDown.bind(this));
    this._div.addEventListener("mouseup", this._handleMouseUp.bind(this));
  }

  _handleMouseDown(e: MouseEvent) {
    this.setactivated(true);
  }

  _handleMouseUp(e: MouseEvent) {
    this.setactivated(false);
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "Button");
    this._bindToDom();
    this._renderBackground();
  }

  /*
  extern Button.onActivate(int activated);
  extern Button.onLeftClick();
  extern Button.onRightClick();
  extern Button.setActivatedNoCallback(Boolean onoff);
  extern Button.leftClick();
  extern Button.rightClick();e
  */
}
