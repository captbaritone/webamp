import { num } from "../../utils";
import { Edges } from "../Clippath";
import ButtonElement from "./ButtonElement";

// https://docs.microsoft.com/en-us/windows/win32/wmp/button-element
export default class ButtonZ extends ButtonElement {
  _backgroundColor: string;
  _transparencyColor: string;
  _clippingColor: string;
  _image: string;
  _hoverImage: string;
  _downImage: string;
  _hoverDownImage: string;
  _disabledImage: string;

  getElTag(): string {
    return "button";
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(_key, value)) {
      return true;
    }

    switch (key) {
      case "backgroundcolor":
        this._backgroundColor = value;
        this._renderBackground();
        break;
      case "zindex":
        const zindex = value;
        this._div.style.zIndex = zindex == "-1" ? "6556" : zindex;
        break;
      case "image":
        this._image = value;
        break;
      case "hoverimage":
        this._hoverImage = value;
        break;
      case "downimage":
        this._downImage = value;
        break;
      case "hoverdownimage":
        this._hoverDownImage = value;
        break;
      case "disabledimage":
        this._disabledImage = value;
        break;
      case "transparencycolor":
        this._transparencyColor = value;
        break;
      case "clippingcolor":
        this._clippingColor = value;
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
    // super._renderBackground();
    if (this._backgroundColor) {
      this._div.style.setProperty("--background-color", this._backgroundColor);
    }
    // _renderBackground() {
    const setCssVar = (bitmapId: string, bitmapMethod: string) => {
      if (bitmapId != null) {
        const bitmap = this._uiRoot.getBitmap(bitmapId);
        if (bitmap != null) {
          bitmap[bitmapMethod](this._div);
        }
      }
    };

    setCssVar(this._image, "setAsBackground");
    setCssVar(this._hoverImage, "setAsHoverBackground");
    setCssVar(this._downImage, "setAsDownBackground");
    setCssVar(this._hoverDownImage, "setAsHoverDownBackground");
    setCssVar(this._disabledImage, "setAsDisabledBackground");
  }

  _renderRegion() {
    if (this._clippingColor) {
      const canvas = this._uiRoot.getBitmap(this._image).getCanvas();
      const edge = new Edges();
      edge.parseCanvasTransparencyByColor(canvas, this._clippingColor);
      if (edge.isSimpleRect()) {
        // this.setXmlAttr("sysregion", "0");
      } else {
        this._div.style.clipPath = edge.getPolygon();
      }
    }
    //? transparency should be done in Bitmap because some image has hole transparency
    // if (this._transparencyColor) {
    //   const canvas = this._uiRoot.getBitmap(this._image).getCanvas();
    //   const edge = new Edges();
    //   edge.parseCanvasTransparencyByColor(canvas, this._transparencyColor);
    //   if (edge.isSimpleRect()) {
    //     // this.setXmlAttr("sysregion", "0");
    //   } else {
    //     this._div.style.clipPath = edge.getPolygon();
    //   }
    // }
  }

  draw() {
    super.draw();
    // renderRegion was done in super.
    this._div.classList.add("webamp--img");
    this._renderBackground();
  }
}
