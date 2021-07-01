import { assert, getId, normalizeDomId, num, px } from "../utils";
import ImageManager from "./ImageManager";

// http://wiki.winamp.com/wiki/XML_Elements#.3Cbitmap.2F.3E
export default class Bitmap {
  _id: string;
  _cssVar: string;
  _url: string;
  _img: HTMLImageElement;
  _canvas: HTMLCanvasElement;
  _x: number;
  _y: number;
  _width: number;
  _height: number;
  _file: string;
  _gammagroup: string;

  setXmlAttributes(attributes: { [attrName: string]: string }) {
    for (const [key, value] of Object.entries(attributes)) {
      this.setXmlAttr(key, value);
    }
  }

  setXmlAttr(_key: string, value: string) {
    const key = _key.toLowerCase();
    switch (key) {
      case "id":
        this._id = value;
        this._cssVar = `--bitmap-${this.getId().replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )}-${getId()}`;
        break;
      case "x":
        this._x = num(value) ?? 0;
        break;
      case "y":
        this._y = num(value) ?? 0;
        break;
      case "w":
        this._width = num(value);
        break;
      case "h":
        this._height = num(value);
        break;
      case "file":
        this._file = value;
        break;
      case "gammagroup":
        this._gammagroup = value;
        break;
      default:
        return false;
    }
    return true;
  }

  getId() {
    return this._id;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  getCSSVar(): string {
    return this._cssVar;
  }

  getGammaGroup(): string {
    return this._gammagroup;
  }

  getImg(): HTMLImageElement {
    return this._img;
  }

  // Ensure we've loaded the image into our image loader.
  async ensureImageLoaded(imageManager: ImageManager) {
    assert(
      this._url == null,
      "Tried to ensure a Bitmap was laoded more than once."
    );

    this._img = await imageManager.getImage(this._file);

    if (this._width == null && this._height == null) {
      this.setXmlAttr("w", String(this._img.width));
      this.setXmlAttr("h", String(this._img.height));
    }

    // this.setUrl(imgUrl);
  }

  _getBackgrondImageCSSAttribute(): string {
    return `var(${this.getCSSVar()})`;
  }

  _getBackgrondPositionCSSAttribute(): string {
    const x = px(-(this._x ?? 0));
    const y = px(-(this._y ?? 0));
    return `${x} ${y}`;
  }

  _getBackgrondSizeCSSAttribute(): string {
    const width = px(this._width);
    const height = px(this._height);
    return `${width} ${height}`;
  }

  _setAsBackground(div: HTMLDivElement, prefix: string) {
    div.style.setProperty(
      `--${prefix}background-image`,
      this._getBackgrondImageCSSAttribute()
    );
    div.style.setProperty(
      `--${prefix}background-position`,
      this._getBackgrondPositionCSSAttribute()
    );
  }

  setAsBackground(div: HTMLDivElement) {
    this._setAsBackground(div, "");
  }

  setAsActiveBackground(div: HTMLDivElement) {
    this._setAsBackground(div, "active-");
  }

  setAsHoverBackground(div: HTMLDivElement) {
    this._setAsBackground(div, "hover-");
  }

  getCanvas(): HTMLCanvasElement {
    if (this._canvas == null) {
      assert(this._img != null, "Expected bitmap image to be loaded");
      this._canvas = document.createElement("canvas");
      this._canvas.width = this.getWidth();
      this._canvas.height = this.getHeight();
      const ctx = this._canvas.getContext("2d");
      ctx.drawImage(this._img, 0, 0, this.getWidth(), this.getHeight());
    }
    return this._canvas;
  }
}
