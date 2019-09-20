import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";
import Wac from "./Wac";
import MakiMap from "./Map";
import Region from "./Region";

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

  ongetwac(wacobj: Wac): void {
    this.js_trigger("onGetWac", wacobj);
  }

  ongiveupwac(wacobj: Wac): void {
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

  setregionfrommap(regionmap: MakiMap, threshold: number, reverse: boolean) {
    unimplementedWarning("setregionfrommap");
    return;
  }

  setregion(reg: Region) {
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
