import { clamp, normalizeDomId, num } from "../utils";
import { glTransformImage } from "./GammaWebGL";

// https://www.pawelporwisz.pl/winamp/wct_en.php
export default class GammaGroup {
  _id: string;
  _value: string;
  _boost: number = 0;
  _gray: number = 0;

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
        break;
      case "value":
        this._value = value;
        break;
      case "boost":
        this._boost = num(value);
        break;
      case "gray":
        this._gray = num(value);
      default:
        return false;
    }
    return true;
  }

  getId() {
    return this._id;
  }

  getDomId() {
    return normalizeDomId(this._id);
  }

  getRgb() {
    return `rgb(${this._value})`;
  }

  // TODO: Figure out how to actually implement this.
  transformImage(img: HTMLImageElement): string {
    // Toggle this to play with gl transforming
    if (false) {
      return glTransformImage(img);
    }
    const [r, g, b] = this._value.split(",").map((v) => {
      return (Number(v) / 4096) * 255;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      if (this._boost) {
        data[i] = (data[i] >> 1, 0, 255); // red
        data[i + 1] = (data[i + 1] >> 1, 0, 255); // green
        data[i + 2] = (data[i + 2] >> 1, 0, 255); // blue
      }

      data[i] = clamp(data[i] + r, 0, 255); // red
      data[i + 1] = clamp(data[i + 1] + g, 0, 255); // green
      data[i + 2] = clamp(data[i + 2] + b, 0, 255); // blue
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }
}
