import BaseObject from "./BaseObject";
import ConfigAttribute from "./ConfigAttribute";
import ConfigPersistent from "./ConfigPersistent";

export default class ConfigItem extends ConfigPersistent {
  static GUID = "d40302824d873aab32128d87d5fcad6f";
  _guid: string;
  _attributes: { [key: string]: ConfigAttribute } = {};
  // _itemGuid: string;

  getStorageName(): string {
    return this._guid;
  }

  constructor(name: string, guid: string) {
    super();
    this._id = name;
    this._guid = guid;
    // this._itemGuid = itemGuid;
    // this._value = ''
    this.loadStorage();
  }

  newattribute(name: string, defaultValue: string): ConfigAttribute {
    let oldValue = this.getValue(name);
    if(oldValue==null) {
      this.setValue(name, defaultValue);
    }
    const cfg = this._attributes[name] || new ConfigAttribute(this, name);
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
      return this.newattribute(att_name, "0");
    }
    return cfg;
    // return new ConfigAttribute(att_name, "1");
  }
}
