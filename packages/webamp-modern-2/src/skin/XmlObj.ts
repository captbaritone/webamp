import * as Utils from "../utils";
import UI_ROOT from "../UIRoot";

export default class XmlObj {
  _id: string;
  _droptarget: string;

  setXmlAttributes(attributes: { [attrName: string]: string }) {
    for (const [key, value] of Object.entries(attributes)) {
      this.setXmlAttr(key, value);
    }
  }

  setXmlAttr(_key: string, _value: string): boolean {
    return false;
  }
}
