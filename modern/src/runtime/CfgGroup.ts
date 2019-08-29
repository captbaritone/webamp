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

  cfgsetint(intvalue) {
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

  cfgsetfloat(floatvalue) {
    unimplementedWarning("cfgsetfloat");
    return;
  }

  cfgsetstring(strvalue) {
    unimplementedWarning("cfgsetstring");
    return;
  }

  oncfgchanged() {
    unimplementedWarning("oncfgchanged");
    return;
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
