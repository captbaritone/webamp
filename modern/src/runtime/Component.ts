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

  ongetwac(wacobj): void {
    this.js_trigger("onGetWac", wacobj);
  }

  ongiveupwac(wacobj): void {
    this.js_trigger("onGiveUpWac", wacobj);
  }

  getguid() {
    unimplementedWarning("getguid");
    return;
  }

  getwac() {
    unimplementedWarning("getwac");
    return;
  }

  setregionfrommap(regionmap, threshold: number, reverse: boolean) {
    unimplementedWarning("setregionfrommap");
    return;
  }

  setregion(reg) {
    unimplementedWarning("setregion");
    return;
  }

  setacceptwac(onoff: boolean) {
    unimplementedWarning("setacceptwac");
    return;
  }

  getcontent() {
    unimplementedWarning("getcontent");
    return;
  }
}

export default Component;
