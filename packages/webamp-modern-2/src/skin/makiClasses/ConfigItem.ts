import XmlObj from "../XmlObj";
import ConfigAttribute from "./ConfigAttribute";


export default class ConfigItem {
  static GUID = "d40302824d873aab32128d87d5fcad6f";
  _name : string;
  _items : {[key:string]: ConfigAttribute} = {};

//   constructor(name:string) {
  // constructor() {
    // super();
    // this._name = name;
    // this._items = {};
  // }

  newattribute(name: string, defaultValue: string): ConfigAttribute {
    const cfg = new ConfigAttribute(name, defaultValue);
    // const cfg = new ConfigAttribute();
    // this._items[name] = cfg;
    return cfg;
  }
}
