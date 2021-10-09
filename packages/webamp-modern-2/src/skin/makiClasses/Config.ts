import XmlObj from "../XmlObj";
import ConfigItem from "./ConfigItem";

export default class Config extends XmlObj {
  static GUID = "593dba224976d07771f452b90b405536";

  newitem(itemName: string, itemGuid: string): ConfigItem {
    return new ConfigItem();
  }
}
