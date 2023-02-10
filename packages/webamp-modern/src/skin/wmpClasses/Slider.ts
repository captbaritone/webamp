import { num, toBool } from "../../utils";
import MakiSlider from "../makiClasses/Slider";
import { solvePendingProps } from "./util";

// https://docs.microsoft.com/en-us/windows/win32/wmp/slider-element
export default class SliderZ extends MakiSlider {
  _pendingProps: { [key: string]: string } = {};
  _background: string;
  _tiled: boolean;
  _borderSize: number;

  getElTag(): string {
    return "slider";
  }

  setXmlAttr(_key: string, _value: string): boolean {
    const key = _key.toLowerCase();
    const value = _value.toLowerCase();
    if (
      ["visible", "enabled", "height", "width", "x", "y", "w", "h"].includes(
        key
      ) &&
      value.startsWith("jscript:")
    ) {
      this._pendingProps[key] = value;
      return true;
    }
    if (super.setXmlAttr(key, value)) {
      //? wmz has no action/param
      // if (key == "id") {
      //   if (value.startsWith("eq")) {
      //     const index = value.substring(2);
      //     this.setxmlparam("action", "eq_band");
      //     this.setxmlparam("param", index);
      //   } else if (value == "balance") {
      //     this.setxmlparam("action", "pan");
      //   } else if (value == "volume") {
      //     this.setxmlparam("action", "volume");
      //   }
      // }
      return true;
    }

    switch (key) {
      case "background":
        this._background = value;
        break;
      case "tiled":
        this._tiled = toBool(value);
        break;
      case "bordersize":
        this._borderSize = num(value);
        break;
      case "value":
        this.setValueToaction(value.toLowerCase());
        break;
      default:
        return false;
    }
    return true;
  }

  setValueToaction(value: string) {
    switch (value) {
      case "wmpprop:player.controls.currentposition":
        this.setxmlparam("action", "seek");
        break;
      case "wmpprop:player.settings.balance":
        this.setxmlparam("action", "pan");
        break;
      case "wmpprop:player.settings.volume":
        this.setxmlparam("action", "volume");
        break;
      default:
        if (value.startsWith("wmpprop:eq.gainlevel")) {
          const eqIndex = value.substring(20);
          this.setxmlparam("action", "eq_band");
          this.setxmlparam("param", eqIndex);
        }
        return;
    }
  }

  // This shadows `getheight()` on GuiObj
  getheight(): number {
    if (this._h) {
      return this._h;
    }
    if (this._background != null) {
      const bitmap = this._uiRoot.getBitmap(this._background);
      if (bitmap) return bitmap.getHeight();
    }
    return super.getheight();
  }

  // This shadows `getwidth()` on GuiObj
  getwidth(): number {
    if (this._w) {
      return this._w;
    }
    if (this._background != null) {
      const bitmap = this._uiRoot.getBitmap(this._background);
      if (bitmap) return bitmap.getWidth();
    }
    return super.getwidth();
  }

  _renderBackground() {
    if (this._background != null) {
      const bitmap = this._uiRoot.getBitmap(this._background);
      this.setBackgroundImage(bitmap);
    } else {
      this.setBackgroundImage(null);
    }
    if (this._tiled) {
      this._div.classList.add("background-stretched");
      if (this._borderSize) {
        let h: number, w: number;
        if (this._vertical) {
          // vertical
          h = this._borderSize;
          w = 0; //Math.min( Math.floor(h/2), Math.floor(this.getwidth()/2) )
        } else {
          // horizontal
          w = this._borderSize;
          h = 0; //Math.min( Math.floor(w/2), Math.floor(this.getheight()/2) )
        }
        this._div.style.setProperty("--border-width", `${w}`);
        this._div.style.setProperty("--border-height", `${h}`);
        this._div.style.setProperty("--border-width-px", `${w}px`);
        this._div.style.setProperty("--border-height-px", `${h}px`);
      }
    }
  }

  draw() {
    solvePendingProps(this, this._pendingProps);
    super.draw();
    this._div.classList.add("webamp--img");
    // this._div.style.pointerEvents = "auto";
    this._renderBackground();
  }
}
