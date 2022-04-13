import BaseObject from "./BaseObject";
import ConfigAttribute from "./ConfigAttribute";

export default class ConfigItem extends BaseObject {
  static GUID = "d40302824d873aab32128d87d5fcad6f";
  _attributes: { [key: string]: ConfigAttribute } = {};
  // _itemGuid: string;

  constructor(name:string) {
    super();
    this._id = name;
    // this._itemGuid = itemGuid;
    // this._value = ''
  }

  newattribute(name: string, defaultValue: string): ConfigAttribute {
    const cfg = new ConfigAttribute(name, defaultValue);
    this._attributes[name] = cfg;
    return cfg;
  }

  getattribute(att_name: string): ConfigAttribute {
    // sample:
    // ConfigItem ciMisc;
    // ciMisc = Config.getItem("Options");
    // configAttribute_system_repeatType = ciMisc.getAttribute("repeat");
    let cfg = this._attributes[att_name];
    if (!cfg) {
      return this.newattribute(att_name, '0')
    }
    return cfg;
    // return new ConfigAttribute(att_name, "1");
  }
}
