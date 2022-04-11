import XmlObj from "../XmlObj";
import BaseObject from "./BaseObject";
import ConfigItem from "./ConfigItem";

const _items: { [key: string]: ConfigItem } = {};

export default class Config extends BaseObject {
  static GUID = "593dba224976d07771f452b90b405536";

  newitem(itemName: string, itemGuid: string): ConfigItem {
    const cfg = new ConfigItem();
    cfg._name = itemName;
    _items[itemGuid] = cfg;
    return cfg;
  }

  getitem(itemGuid: string): ConfigItem {
    let cfg = _items[itemGuid];
    if (!cfg) {
      cfg = new ConfigItem();
      _items[itemGuid] = cfg;
    }
    return cfg;
  }
}

// Global Singleton
export const CONFIG: Config = new Config();
