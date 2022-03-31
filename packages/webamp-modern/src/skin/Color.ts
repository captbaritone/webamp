import ImageManager from "./ImageManager";

export default class Color {
  _id: string;
  _cssVar: string;
  _value: string;
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
        this._cssVar = `--color-${this.getId().replace(/[^a-zA-Z0-9]/g, "-")}`;
        break;
      case "value":
        this._value = value;
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

  getGammaGroup(): string {
    return this._gammagroup;
  }

  getValue(): string {
    return this._value;
  }

  getCSSVar(): string {
    return this._cssVar;
  }

  getRgb() {
    return `rgb(${this._value})`;
  }
}
