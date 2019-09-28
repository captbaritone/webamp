import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class ConfigItem extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "ConfigItem";
  }

  getattribute(attr_name: string) {
    unimplementedWarning("getattribute");
    return;
  }

  newattribute(attr_name: string, default_val: string) {
    unimplementedWarning("newattribute");
    return;
  }

  getguid(attr_name: string) {
    unimplementedWarning("getguid");
    return;
  }

  getname() {
    unimplementedWarning("getname");
    return;
  }
}

export default ConfigItem;
