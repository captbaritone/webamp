import XmlObj from "../XmlObj";

export default class MapObj extends XmlObj {
  static GUID = "38603665461B42a7AA75D83F6667BF73";

  _id: string;
  _name: string;
  constructor() {
    super();
  }

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "name":
        this._name = value;
        break;
      case "id":
        this._id = value.toLowerCase();
        break;
      default:
        return false;
    }
    return true;
  }
}
