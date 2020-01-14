import MakiObject from "./MakiObject";
import ConfigItem from "./ConfigItem";
import { unimplementedWarning } from "../utils";

class Config extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Config";
  }

  newitem(item_name: string, item_guid: string) {
    unimplementedWarning("newitem");
    // @ts-ignore Currently ConfigItem has no XMLNode which is busted, but
    // should change once we get better machanisms for adding children to a
    // mutable XML state tree.
    return new ConfigItem(null, this);
  }

  getitem(item_name: string) {
    return unimplementedWarning("getitem");
  }

  getitembyguid(item_guid: string) {
    return unimplementedWarning("getitembyguid");
  }
}

export default Config;
