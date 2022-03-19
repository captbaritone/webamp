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

  transformImage(
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ): string {
    const [r, g, b] = this._value.split(",").map((v) => {
      return Number(v) / 4096 + 1.0;
    });
    const W = w || img.width;
    const H = h || img.height;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, x ? -x : 0, y ? -y : 0);
    const imageData = ctx.getImageData(0, 0, W, H);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      let [ir, ig, ib] = [data[i], data[i + 1], data[i + 2]];
      if (this._gray != 0) {
        if (this._gray == 2) ir = (ir + ig + ib) / 3;
        if (this._gray == 1) ir = Math.max(ir, ig, ib);
        ig = ir;
        ib = ir;
      }
      const mult = this._boost == 2 ? 4 : 1;
      const brightness = this._boost == 1 ? 128 : this._boost == 2 ? 32 : 0;

      data[i + 0] = clamp((ir + brightness) * mult * r, 0, 255); // red
      data[i + 1] = clamp((ig + brightness) * mult * g, 0, 255); // green
      data[i + 2] = clamp((ib + brightness) * mult * b, 0, 255); // blue
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }
}
