import BaseObject from "./BaseObject";
import ConfigItem from "./ConfigItem";
import ConfigPersistent from "./ConfigPersistent";

export default class Config extends ConfigPersistent {
  static GUID = "593dba224976d07771f452b90b405536";
  _id: string = "CONFIG";
  _items: { [key: string]: ConfigItem } = {};

  getStorageName(): string {
    return "_CONFIG_";
  }
  /**
   * SAMPLE:
   *    create the custom cfgpage for this session (if it does exist, it just returns it)
   *    ConfigItem custom_page = Config.newItem("Winamp Modern", CUSTOM_PAGE);
   * @param itemName
   * @param itemGuid
   * @returns
   */
  newitem(itemName: string, itemGuid: string): ConfigItem {
    const cfg = new ConfigItem(itemName, itemGuid);
    // cfg._name = itemName;
    this._items[itemGuid] = cfg;
    this._configTree[itemName] = itemGuid;
    this._saveState();
    return cfg;
  }

  getitem(itemGuid: string): ConfigItem {
    let cfg = this._items[itemGuid];
    if (!cfg) {
      return this.newitem(itemGuid, itemGuid);
      //   cfg = new ConfigItem();
      //   _items[itemGuid] = cfg;
    }
    return cfg;
  }
}

// Global Singleton
export const CONFIG: Config = new Config();
