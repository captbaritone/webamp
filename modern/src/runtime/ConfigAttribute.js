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

  setdata(value) {
    unimplementedWarning("setdata");
    return;
  }

  getdata() {
    unimplementedWarning("getdata");
    return;
  }

  ondatachanged() {
    unimplementedWarning("ondatachanged");
    return;
  }

  getparentitem() {
    unimplementedWarning("getparentitem");
    return;
  }

  getattributename() {
    unimplementedWarning("getattributename");
    return;
  }
}

export default ConfigAttribute;
