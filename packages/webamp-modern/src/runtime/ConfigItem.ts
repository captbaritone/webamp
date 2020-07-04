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
    return unimplementedWarning("getattribute");
  }

  newattribute(attr_name: string, default_val: string) {
    return unimplementedWarning("newattribute");
  }

  getguid(attr_name: string): string {
    return unimplementedWarning("getguid");
  }

  getname(): string {
    return unimplementedWarning("getname");
  }
}

export default ConfigItem;
