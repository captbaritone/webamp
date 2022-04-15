import BaseObject from "./BaseObject";
import { CONFIG } from "./Config";
// import Config from "./Config";
import ConfigAttribute from "./ConfigAttribute";
// import { SectionValues } from "./ConfigPersistent";
// import ConfigPersistent from "./ConfigPersistent";

export default class ConfigItem extends BaseObject {
  static GUID = "d40302824d873aab32128d87d5fcad6f";
  _guid: string;
  // _config: Config;
  // _section: SectionValues;
  _attributes: { [key: string]: ConfigAttribute } = {};
  // _itemGuid: string;

  // getStorageName(): string {
  //   return this._guid;
  // }

  constructor(name: string, guid: string) {
    super();
    this._id = name;
    this._guid = guid;
    // this._config = config;
    // this._section = CONFIG.getSectionValues(guid);
    // this._itemGuid = itemGuid;
    // this._value = ''
    // this.loadStorage();
  }

  getname(): string {
    return this._id;
  }

  getguid(attr_name: string): string {
    return this._guid;
  }

  getValue(key: string): string {
    return CONFIG.getValue(this._guid, key);
  }
  setValue(key: string, value: string) {
    return CONFIG.setValue(this._guid, key, value);
  }

  newattribute(name: string, defaultValue: string): ConfigAttribute {
    let oldValue = this.getValue(name);
    if (oldValue == null) {
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
