import GuiObject from "./GuiObject";
import { unimplementedWarning } from "../utils";
import Wac from "./Wac";
import MakiMap from "./MakiMap";
import Region from "./Region";

class WindowHolder extends GuiObject {
  /**
   * getClassName()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "WindowHolder";
  }

  ongetwac(wacobj: Wac): void {
    this.js_trigger("onGetWac", wacobj);
  }

  ongiveupwac(wacobj: Wac): void {
    this.js_trigger("onGiveUpWac", wacobj);
  }

  getguid(): string {
    return unimplementedWarning("getguid");
  }

  getwac() {
    return unimplementedWarning("getwac");
  }

  setregionfrommap(
    regionmap: MakiMap,
    threshold: number,
    reverse: boolean
  ): void {
    return unimplementedWarning("setregionfrommap");
  }

  setregion(reg: Region): void {
    return unimplementedWarning("setregion");
  }

  setacceptwac(onoff: boolean): void {
    return unimplementedWarning("setacceptwac");
  }

  getcontent() {
    return unimplementedWarning("getcontent");
  }

  getcomponentname(): string {
    return unimplementedWarning("getcomponentname");
  }
}

export default WindowHolder;
