import { UIRoot } from "../UIRoot";
import { assert, getId, normalizeDomId, num, px } from "../utils";
import ImageManager from "./ImageManager";

export function genCssVar(bitmapId: string): string {
  return `--bitmap-${bitmapId.replace(/[^a-zA-Z0-9]/g, "-")}`;
}

// http://wiki.winamp.com/wiki/XML_Elements#.3Cbitmap.2F.3E
export default class Bitmap {
  _id: string;
  _uiRoot: UIRoot; // lazy set
  _cssVar: string;
  _url: string;
  _img: CanvasImageSource;
  _canvas: HTMLCanvasElement;
  _x: number = 0;
  _y: number = 0;
  _w: number;
  _h: number;
  _file: string;
  _gammagroup: string;

  // I am not sure, is bitmap need UiRoot?
  constructor(uiRoot: UIRoot = null) {
    this._uiRoot = uiRoot;
  }
  setUiRoot(uiRoot: UIRoot) {
    this._uiRoot = uiRoot;
  }

  setXmlAttributes(attributes: { [attrName: string]: string }) {
    for (const [key, value] of Object.entries(attributes)) {
      this.setXmlAttr(key, value);
    }
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    switch (key) {
      case "id":
        this._id = value; //TODO: should be lowerCase here.
        this._cssVar = genCssVar(this.getId());
        break;
      case "x":
        this._x = num(value) ?? 0;
        break;
      case "y":
        this._y = num(value) ?? 0;
        break;
      case "w":
        this._w = num(value);
        break;
      case "h":
        this._h = num(value);
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
    return this._id || "";
  }

  getFile() {
    return this._file || "";
  }

  getWidth() {
    return this._w;
  }

  getHeight() {
    return this._h;
  }

  getLeft() {
    return this._x;
  }

  getTop() {
    return this._y;
  }

  getCSSVar(): string {
    return this._cssVar;
  }

  getGammaGroup(): string {
    return this._gammagroup;
  }

  getImg(): CanvasImageSource {
    return this._img;
  }
  setImage(img: CanvasImageSource) {
    // await imageManager.setImage(this._file, url);
    // await this.ensureImageLoaded(imageManager);
    this._img = img;
  }

  loaded(): boolean {
    return this._img != null;
  }

  // Ensure we've loaded the image into our image loader.
  async ensureImageLoaded(imageManager: ImageManager) {
    assert(
      this._url == null,
      "Tried to ensure a Bitmap was laoded more than once."
    );

    //force. also possibly set null:
    this._img = await imageManager.getImage(this._file);
    if (this._img && this._w == null && this._h == null) {
      this.setXmlAttr("w", String(this._img.width));
      this.setXmlAttr("h", String(this._img.height));
    }
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
    const width = px(this._w);
    const height = px(this._h);
    return `${width} ${height}`;
  }

  _setAsBackground(div: HTMLElement, prefix: string) {
    div.style.setProperty(
      `--${prefix}background-image`,
      this._getBackgrondImageCSSAttribute()
    );
  }

  setAsBackground(div: HTMLElement) {
    this._setAsBackground(div, "");
  }

  setAsDownBackground(div: HTMLElement) {
    this._setAsBackground(div, "down-");
  }

  setAsActiveBackground(div: HTMLElement) {
    this._setAsBackground(div, "active-");
  }
  setAsInactiveBackground(div: HTMLElement) {
    this._setAsBackground(div, "inactive-");
  }

  setAsHoverBackground(div: HTMLElement) {
    this._setAsBackground(div, "hover-");
  }

  setAsHoverDownBackground(div: HTMLElement) {
    this._setAsBackground(div, "hover-down-");
  }

  setAsDisabledBackground(div: HTMLElement) {
    this._setAsBackground(div, "disabled-");
  }

  async getGammaTransformedUrl(uiRoot: UIRoot): Promise<string> {
    const buildCssProp = (url: string) => `  ${this.getCSSVar()}: url(${url});`;
    const img = this.getImg();
    if (!img) {
      console.warn(`Bitmap/font ${this.getId()} has no img. skipped.`);
      return "";
    }

    const groupId = this.getGammaGroup();
    const gammaGroup = uiRoot._getGammaGroup(groupId);
    if (gammaGroup._value == "0,0,0") {
      // triple zero meaning no gamma should be applied.
      // return bitmap.getCanvas().toDataURL();
      const url = await this.toDataURL(uiRoot);
      return buildCssProp(url);
    }
    const url = gammaGroup.transformImage(
      img as HTMLImageElement,
      this._x,
      this._y,
      this._w,
      this._h
    );
    return buildCssProp(url);
  }
  /**
   * Final function that uses Bitmap;
   * Afther call this, bitmap maybe destroyed.
   * @returns url string used as embedded in <head><style>
   */
  async toDataURL(uiRoot: UIRoot): Promise<string> {
    if (this._file.endsWith(".gif") /* && !this._transparentColor */) {
      // don't draw _img into canvas, if it is animated gif
      return await uiRoot.getImageManager().getUrl(this._file);
    } else {
      return this.getCanvas().toDataURL();
    }
  }

  /**
   * Useful for calculating clip-path
   * @param store whether the generated canvas should be
   *              kept by this bitmap instance
   * @returns <canvas/>
   */
  getCanvas(store: boolean = false): HTMLCanvasElement {
    let workingCanvas: HTMLCanvasElement;
    if (this._canvas == null || !store) {
      assert(
        this._img != null,
        `Expected bitmap image to be loaded: ${this.getId()}`
      );
      if (this._img instanceof HTMLCanvasElement) {
        workingCanvas = this._img;
      } else {
        workingCanvas = document.createElement("canvas");
        workingCanvas.width = this.getWidth() /* || this._img.width */;
        workingCanvas.height = this.getHeight() /* || this._img.height */;
        const ctx = workingCanvas.getContext("2d");
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        ctx.drawImage(this._img, -this._x, -this._y);
      }
      if (store) {
        this._canvas = workingCanvas;
      }
    }
    if (store) {
      workingCanvas = this._canvas;
    }
    return workingCanvas;
  }
}
