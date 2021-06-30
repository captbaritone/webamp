import { normalizeDomId, num, toBool } from "../utils";

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
}
