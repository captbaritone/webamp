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

  cfggetint(): number {
    return unimplementedWarning("cfggetint");
  }

  cfgsetint(intvalue: number): void {
    return unimplementedWarning("cfgsetint");
  }

  cfggetstring(): string {
    return unimplementedWarning("cfggetstring");
  }

  cfggetfloat(): number {
    return unimplementedWarning("cfggetfloat");
  }

  cfgsetfloat(floatvalue: number): void {
    return unimplementedWarning("cfgsetfloat");
  }

  cfgsetstring(strvalue: string): void {
    return unimplementedWarning("cfgsetstring");
  }

  oncfgchanged(): void {
    this.js_trigger("onCfgChanged");
  }

  cfggetguid(): string {
    return unimplementedWarning("cfggetguid");
  }

  cfggetname(): string {
    return unimplementedWarning("cfggetname");
  }
}

export default CfgGroup;
