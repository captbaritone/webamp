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

  getattribute(attr_name) {
    unimplementedWarning("getattribute");
    return;
  }

  newattribute(attr_name, default_val) {
    unimplementedWarning("newattribute");
    return;
  }

  getguid(attr_name) {
    unimplementedWarning("getguid");
    return;
  }
}

export default ConfigItem;
