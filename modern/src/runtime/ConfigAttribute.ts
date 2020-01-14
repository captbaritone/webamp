import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class ConfigAttribute extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "ConfigAttribute";
  }

  setdata(value: string): void {
    return unimplementedWarning("setdata");
  }

  getdata(): string {
    return unimplementedWarning("getdata");
  }

  ondatachanged(): void {
    this.js_trigger("onDataChanged");
  }

  getparentitem() {
    return unimplementedWarning("getparentitem");
  }

  getattributename(): string {
    return unimplementedWarning("getattributename");
  }
}

export default ConfigAttribute;
