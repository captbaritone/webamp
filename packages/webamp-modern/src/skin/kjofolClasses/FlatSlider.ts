import { num, px } from "../../utils";
import Slider from "../makiClasses/Slider";

/**
 * Anotrher Slider that has no thumb-button,
 * but has framed-background for indicator/value.
 */
export default class FlatSlider extends Slider {
  _image: string;
  _frameWidth: number;
  _frameHeight: number;
  _frameCount: number = 1; // avoid dividing by zero
  _frameVertical: boolean = true;

  getElTag(): string {
    return "slider";
  }

  setXmlAttr(_key: string, value: string): boolean {
    if (super.setXmlAttr(_key, value)) {
      return true;
    }
    const key = _key.toLowerCase();
    switch (key) {
      case "image":
        this._image = value;
        break;
      case "framecount":
        this._frameCount = num(value);
        break;
      case "frameheight":
        // (int) The height in pixels of each cell of animation.
        // If frameheight is set, the animation will be assumed to be a vertical
        // strip of cells in the given bitmap.
        this._frameHeight = num(value);
        this._frameVertical = true;
        break;
      case "framewidth":
        // (int) The height in pixels of each cell of animation.
        // If frameheight is set, the animation will be assumed to be a vertical
        // strip of cells in the given bitmap.
        this._frameWidth = num(value);
        this._frameVertical = false;
        break;
      default:
        return false;
    }
    return true;
  }

  _checkMouseDownInThumb(x: number, y: number) {
    // do nothing
  }
  _prepareThumbBitmaps() {
    // do nothing
  }

  _renderThumbPosition() {
    const actual = this._getActualSize();
    if (this._frameVertical) {
      // const top = Math.floor(
      //   Math.max(0, (1 - this._position) * (actual.height - this._thumbHeight))
      // );
      // if (this._thumbTop != top) {
      //   this._thumbTop = top;
      //   this._div.style.setProperty("--thumb-top", px(top));
      // }
    } else {
      const left =
        Math.floor(this._position * (this._frameCount - 1)) * this._frameWidth;
      if (this._thumbLeft != left) {
        this._thumbLeft = left;
        this._div.style.backgroundPositionX = px(-left);
      }
    }
  }

  _renderBackground() {
    const bitmap =
      this._image != null ? this._uiRoot.getBitmap(this._image) : null;
    this.setBackgroundImage(bitmap);
  }

  draw() {
    super.draw();
    this._div.classList.add("webamp--img");
    this._renderBackground();
  }
}
