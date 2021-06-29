import { SkinContext } from "../types";
import { assert, num, toBool, px } from "../utils";
import Bitmap from "./Bitmap";
import { VM } from "./VM";
import XmlObj from "./XmlObj";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#GuiObject_.28Global_params.29
export default class GuiObj extends XmlObj {
  _id: string;
  _width: number;
  _height: number;
  _x: number = 0;
  _y: number = 0;
  _droptarget: string;
  _visible: boolean = true;
  _alpha: number = 255;
  _ghost: boolean = false;
  _tooltip: string = "";
  _div: HTMLDivElement = document.createElement("div");

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    switch (key) {
      case "id":
        this._id = value.toLowerCase();
        break;
      case "w":
        this._width = num(value);
        break;
      case "h":
        this._height = num(value);
        break;
      case "x":
        this._x = num(value) ?? 0;
        break;
      case "y":
        this._y = num(value) ?? 0;
        break;
      case "droptarget":
        this._droptarget = value;
        break;
      case "ghost":
        this._ghost = toBool(value);
        break;
      case "visible":
        this._visible = toBool(value);
        break;
      case "tooltip":
        this._tooltip = value;
        break;
      // (int) An integer [0,255] specifying the alpha blend mode of the object (0 is transparent, 255 is opaque). Default is 255.
      case "alpha":
        this._alpha = num(value);
      default:
        return false;
    }
    return true;
  }

  init(context: SkinContext) {
    // pass
  }

  getDiv(): HTMLDivElement {
    return this._div;
  }

  getId(): string {
    return this._id;
  }

  /**
   * Trigger the show event.
   */
  show() {
    this._visible = true;
    this._renderVisibility();
  }

  /**
   * Trigger the hide event.
   */
  hide() {
    this._visible = false;
    this._renderVisibility();
  }

  /**
   * Get the Y position, in the screen, of the
   * top edge of the object.
   *
   * @ret The top edge's position (in screen coordinates).
   */
  gettop(): number {
    return this._div.getBoundingClientRect().top;
  }

  /**
   * Get the X position, in the screen, of the
   * left edge of the object.
   *
   * @ret The left edge's position (in screen coordinates).
   */
  getleft(): number {
    return this._div.getBoundingClientRect().left;
  }

  /**
   * Get the height of the object, in pixels.
   *
   * @ret The height of the object.
   */
  getheight(): number {
    assert(
      this._height != null,
      `Expected GUIObj to have a height in ${this.getId()}.`
    );
    // FIXME
    return this._height;
  }

  /**
   * Get the width of the object, in pixels.
   *
   * @ret The width of the object.
   */
  getwidth(): number {
    assert(
      this._width != null,
      `Expected GUIObj to have a width in ${this.getId()}.`
    );
    return this._width;
  }

  /**
   * Resize the object to the desired size and position.
   *
   * @param  x   The X position where to anchor the object before resize.
   * @param  y   The Y position where to anchor the object before resize.
   * @param  w   The width you wish the object to have.
   * @param  h   The height you wish the object to have.
   */
  resize(x: number, y: number, w: number, h: number) {
    this._x = x;
    this._y = y;
    this._width = w;
    this._height = h;
    this._renderDimensions();
  }

  /**
   * Hookable. Event happens when the left mouse
   * button was previously down and is now up.
   *
   * @param  x   The X position in the screen where the cursor was when the event was triggered.
   * @param  y   The Y position in the screen where the cursor was when the event was triggered.
   */
  onLeftButtonUp(x: number, y: number) {
    VM.dispatch(this, "onleftbuttonup", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
  }

  /**
   * Hookable. Event happens when the left mouse button
   * is pressed.
   *
   * @param  x   The X position in the screen where the cursor was when the event was triggered.
   * @param  y   The Y position in the screen where the cursor was when the event was triggered.
   */
  onLeftButtonDown(x: number, y: number) {
    VM.dispatch(this, "onleftbuttondown", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
  }

  /**
   * Hookable. Event happens when the right mouse button
   * was previously down and is now up.
   *
   * @param  x   The X position in the screen where the cursor was when the event was triggered.
   * @param  y   The Y position in the screen where the cursor was when the event was triggered.
   */
  onRightButtonUp(x: number, y: number) {
    VM.dispatch(this, "onrightbuttonup", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
  }

  /**
   * Hookable. Event happens when the right mouse button
   * is pressed.
   *
   * @param  x   The X position in the screen where the cursor was when the event was triggered.
   * @param  y   The Y position in the screen where the cursor was when the event was triggered.
   */
  onRightButtonDown(x: number, y: number) {
    VM.dispatch(this, "onrightbuttondown", [
      { type: "INT", value: x },
      { type: "INT", value: y },
    ]);
  }

  /**
   * Set the alphablending value of the object.
   * Value ranges from 0 (fully transparent) to
   * 255 (fully opaque).
   *
   * @param  alpha   The alpha value.
   */
  setalpha(alpha: number) {
    this._alpha = alpha;
    this._renderAlpha();
  }

  _renderAlpha() {
    this._div.style.opacity = `${this._alpha / 255}`;
  }
  _renderVisibility() {
    this._div.style.display = this._visible ? "inline-block" : "none";
  }
  _renderDimensions() {
    if (this._x) {
      this._div.style.left = px(this._x);
    }
    if (this._y) {
      this._div.style.top = px(this._y);
    }
    this._div.style.width = px(this.getwidth());
    this._div.style.height = px(this.getheight());
  }

  setBackgroundImage(bitmap: Bitmap) {
    this._div.style.setProperty(
      "--background-image",
      bitmap.getBackgrondImageCSSAttribute()
    );
    this._div.style.setProperty(
      "--background-position",
      bitmap.getBackgrondPositionCSSAttribute()
    );
  }

  // JS Can't set the :active pseudo selector. Instead we have a hard-coded
  // pseduo-selector in our stylesheet which references a CSS variable and then
  // we control the value of that variable from JS.
  setActiveBackgroundImage(bitmap: Bitmap) {
    this._div.style.setProperty(
      "--active-background-image",
      bitmap.getBackgrondImageCSSAttribute()
    );
    this._div.style.setProperty(
      "--active-background-position",
      bitmap.getBackgrondPositionCSSAttribute()
    );
  }

  draw() {
    this._div.setAttribute("data-id", this.getId());
    this._div.classList.add("webamp--guiobj");
    this._renderVisibility();
    this._div.style.position = "absolute";
    this._renderAlpha();
    if (this._tooltip) {
      this._div.setAttribute("title", this._tooltip);
    }
    if (this._ghost) {
      this._div.style.pointerEvents = "none";
    }
    this._renderDimensions();

    this._div.addEventListener("mouseup", (e) => {
      this.onLeftButtonUp(e.clientX, e.clientY);
    });

    this._div.addEventListener("mousedown", (e) => {
      this.onLeftButtonDown(e.clientX, e.clientY);
    });
  }
}
