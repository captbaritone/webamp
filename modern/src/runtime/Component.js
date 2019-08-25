import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";

class Component extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Component";
  }

  ongetwac(wacobj) {
    unimplementedWarning("ongetwac");
    return;
  }

  ongiveupwac(wacobj) {
    unimplementedWarning("ongiveupwac");
    return;
  }

  getguid() {
    unimplementedWarning("getguid");
    return;
  }

  getwac() {
    unimplementedWarning("getwac");
    return;
  }

  setregionfrommap(regionmap, threshold, reverse) {
    unimplementedWarning("setregionfrommap");
    return;
  }

  setregion(reg) {
    unimplementedWarning("setregion");
    return;
  }

  setacceptwac(onoff) {
    unimplementedWarning("setacceptwac");
    return;
  }

  getcontent() {
    unimplementedWarning("getcontent");
    return;
  }
}

export default Component;
