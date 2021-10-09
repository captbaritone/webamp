import GuiObj from "./GuiObj";
import UI_ROOT from "../../UIRoot";
import { V } from "../../maki/v";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cbutton.2F.3E_.26_.3Ctogglebutton.2F.3E
export default class Button extends GuiObj {
  static GUID = "698eddcd4fec8f1e44f9129b45ff09f9";
  _image: string;
  _downimage: string;
  _active: boolean = false;
  _action: string | null = null;
  _param: string | null = null;
  _actionTarget: string | null = null;

  constructor() {
    super();
    // TODO: Cleanup!
    this._div.addEventListener("mousedown", this._handleMouseDown.bind(this));
    this._div.addEventListener("click", (e) => {
      if (this._action) {
        this.dispatchAction(this._action, this._param, this._actionTarget);
      }
      // TODO: Only left button
      this.onLeftClick();
    });
  }

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
      case "param":
        this._param = value;
        break;
      case "action_target":
        this._actionTarget = value;
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
      UI_ROOT.vm.dispatch(this, "onactivate", [V.newBool(onoff)]);
    }
  }

  leftclick() {
    this.onLeftClick();
  }

  onLeftClick() {
    UI_ROOT.vm.dispatch(this, "onleftclick", []);
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

  _handleMouseDown(e: MouseEvent) {
    this.setactivated(!this._active);
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "Button");
    this._div.classList.add("webamp--img");
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
