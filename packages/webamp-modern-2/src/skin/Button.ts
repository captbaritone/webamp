import GuiObj from "./GuiObj";
import UI_ROOT from "../UIRoot";
import { px } from "../utils";
import { VM } from "./VM";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cbutton.2F.3E_.26_.3Ctogglebutton.2F.3E
export default class Button extends GuiObj {
  _image: string;
  _downimage: string;
  _active: boolean = false;
  _action: string | null = null;

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "image":
        this._image = value;
        this._renderBackground();
        break;
      case "downimage":
        this._downimage = value;
        this._renderBackground();
        break;
      case "action":
        this._action = value;
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
  setactivated(_onoff: boolean) {
    const onoff = Boolean(_onoff);

    if (onoff !== this._active) {
      this._active = onoff;
      VM.dispatch(this, "onactivate", [{ type: "BOOL", value: onoff ? 1 : 0 }]);
    }
  }

  onLeftClick() {
    VM.dispatch(this, "onleftclick", []);
  }

  _renderBackground() {
    if (this._image != null) {
      const bitmap = UI_ROOT.getBitmap(this._image);
      this.setBackgroundImage(bitmap);
    } else {
      this.setBackgroundImage(null);
    }

    if (this._downimage != null) {
      const downBitmap = UI_ROOT.getBitmap(this._downimage);
      this.setActiveBackgroundImage(downBitmap);
    } else {
      this.setActiveBackgroundImage(null);
    }
  }

  _bindToDom() {
    // TODO: Cleanup!
    this._div.addEventListener("mousedown", this._handleMouseDown.bind(this));
    this._div.addEventListener("click", (e) => {
      if (this._action) {
        UI_ROOT.dispatch(this._action);
      }
      // TODO: Only left button
      this.onLeftClick();
    });
  }

  _handleMouseDown(e: MouseEvent) {
    this.setactivated(!this._active);
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
