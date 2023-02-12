import { UIRoot } from "../../UIRoot";
import XmlObj from "../XmlObj";
import BaseObject from "./BaseObject";
import ConfigItem from "./ConfigItem";
import ConfigPersistent, { SectionValues } from "./ConfigPersistent";

export default class Config extends ConfigPersistent {
  static GUID = "593dba224976d07771f452b90b405536";
  _id: string = "CONFIG";
  _uiRoot: UIRoot;
  _aliases: SectionValues;
  _items: { [key: string]: ConfigItem } = {};

  getStorageName(): string {
    return "_CONFIG_";
  }

  constructor(uiRoot: UIRoot) {
    super();
    this._uiRoot = uiRoot;
    this._aliases = this.getSectionValues("_alias_");
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
    itemGuid = itemGuid.toLowerCase();
    // line below wouldn't replace the _configTree. ^_^v
    // const cfg = new ConfigItem(this._uiRoot, this, itemName, itemGuid);
    
    let cfg = this._items[itemGuid];
    if(!cfg){
      cfg = new ConfigItem(this._uiRoot, this, itemName, itemGuid);
      this._items[itemGuid] = cfg;
    }

    if(itemName.toLowerCase() == itemGuid){
      itemName = itemGuid
    }
    this._aliases[itemName] = itemGuid;
    this._saveState();
    return cfg;
  }

  getitem(item_name: string): ConfigItem {
    const item_guid = this._aliases[item_name] || item_name;
    const cfg = this._items[item_guid.toLowerCase()];
    if (!cfg) {
      return this.newitem(item_name, item_guid);
    }
    return cfg;
  }

  getitembyguid(item_guid: string): ConfigItem {
    item_guid = item_guid.toLowerCase();
    const cfg = this._items[item_guid];
    if (!cfg) {
      const item_name =
        Object.keys(this._aliases).find(
          (key) => this._aliases[key] === item_guid
        ) || item_guid;
      return this.newitem(item_name, item_guid);
    }
    return cfg;
  }
}

// Global Singleton
// export const CONFIG: Config = new Config();
