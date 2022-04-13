import BaseObject from "./BaseObject";
import ConfigAttribute from "./ConfigAttribute";

export default class ConfigItem extends BaseObject {
  static GUID = "d40302824d873aab32128d87d5fcad6f";
  _items: { [key: string]: ConfigAttribute } = {};
  // _itemGuid: string;

  constructor(name:string) {
    super();
    this._id = name;
    // this._itemGuid = itemGuid;
    // this._value = ''
  }

  newattribute(name: string, defaultValue: string): ConfigAttribute {
    const cfg = new ConfigAttribute(name, defaultValue);
    // const cfg = new ConfigAttribute();
    // this._items[name] = cfg;
    return cfg;
  }

  getattribute(att_name: string): ConfigAttribute {
    // sample:
    // ConfigItem ciMisc;
    // ciMisc = Config.getItem("Options");
    // configAttribute_system_repeatType = ciMisc.getAttribute("repeat");
    return new ConfigAttribute(att_name, "1");
  }
}
