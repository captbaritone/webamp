import XmlObj from "../XmlObj";
import ConfigItem from "./ConfigItem";

const _items : {[key:string]: ConfigItem} = {};

export default class Config extends XmlObj {
  static GUID = "593dba224976d07771f452b90b405536";

  newitem(itemName: string, itemGuid: string): ConfigItem {
    return new ConfigItem();
  }

  getitem(itemName: string): ConfigItem {
    console.log(`Config.getItem(${itemName})`)
    let cfg = _items[itemName];
    if(!cfg){
      cfg = new ConfigItem();
      _items[itemName] = cfg;  
    } 
    return cfg;
  }
}
