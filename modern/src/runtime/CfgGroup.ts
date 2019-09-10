import Group from "./Group";
import { unimplementedWarning } from "../utils";

class CfgGroup extends Group {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "CfgGroup";
  }

  cfggetint() {
    unimplementedWarning("cfggetint");
    return;
  }

  cfgsetint(intvalue: number) {
    unimplementedWarning("cfgsetint");
    return;
  }

  cfggetstring() {
    unimplementedWarning("cfggetstring");
    return;
  }

  cfggetfloat() {
    unimplementedWarning("cfggetfloat");
    return;
  }

  cfgsetfloat(floatvalue: number) {
    unimplementedWarning("cfgsetfloat");
    return;
  }

  cfgsetstring(strvalue: string) {
    unimplementedWarning("cfgsetstring");
    return;
  }

  oncfgchanged(): void {
    this.js_trigger("onCfgChanged");
  }

  cfggetguid() {
    unimplementedWarning("cfggetguid");
    return;
  }

  cfggetname() {
    unimplementedWarning("cfggetname");
    return;
  }
}

export default CfgGroup;
