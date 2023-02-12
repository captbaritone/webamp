import { UIRoot } from "../../UIRoot";
import BaseObject from "./BaseObject";
import Config from "./Config";
// import { CONFIG } from "./Config";
// import Config from "./Config";
import ConfigAttribute from "./ConfigAttribute";
// import { SectionValues } from "./ConfigPersistent";
// import ConfigPersistent from "./ConfigPersistent";

export default class ConfigItem extends BaseObject {
  static GUID = "d40302824d873aab32128d87d5fcad6f";
  _uiRoot: UIRoot;
  _config: Config;
  _guid: string;
  _attributes: { [key: string]: ConfigAttribute } = {};

  constructor(uiRoot: UIRoot, config: Config, name: string, guid: string) {
    super();
    this._uiRoot = uiRoot;
    this._config = config;
    this._id = name;
    this._guid = guid.toLowerCase();
  }

  getname(): string {
    return this._id;
  }

  getguid(attr_name: string): string {
    return this._guid;
  }

  getValue(key: string): string {
    return this._config.getValue(this._guid, key);
  }
  setValue(key: string, value: string) {
    return this._config.setValue(this._guid, key, value);
  }

  newattribute(name: string, defaultValue: string): ConfigAttribute {
    name = name.toLowerCase();
    let oldValue = this.getValue(name);
    if (oldValue == null) {
      this.setValue(name, defaultValue);
    }
    const cfg = this._attributes[name] || new ConfigAttribute(this, name);
    this._attributes[name] = cfg;
    return cfg;
  }

  getattribute(att_name: string): ConfigAttribute {
    att_name = att_name.toLowerCase();
    // sample:
    // ConfigItem ciMisc;
    // ciMisc = Config.getItem("Options");
    // configAttribute_system_repeatType = ciMisc.getAttribute("repeat");
    let cfg = this._attributes[att_name];
    if (!cfg) {
      return this.newattribute(att_name, "0");
    }
    return cfg;
  }
}
