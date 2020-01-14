import MakiObject from "./MakiObject";
import { unimplementedWarning } from "../utils";

class Wac extends MakiObject {
  /**
   * getclassname()
   *
   * Returns the class name for the object.
   * @ret The class name.
   */
  getclassname() {
    return "Wac";
  }

  getguid(): string {
    return unimplementedWarning("getguid");
  }

  getname(): string {
    return unimplementedWarning("getname");
  }

  sendcommand(
    cmd: string,
    param1: number,
    param2: number,
    param3: string
  ): number {
    return unimplementedWarning("sendcommand");
  }

  show(): void {
    return unimplementedWarning("show");
  }

  hide(): void {
    return unimplementedWarning("hide");
  }

  isvisible(): boolean {
    return unimplementedWarning("isvisible");
  }

  // @ts-ignore This (deprecated) method's signature does not quite match the
  // same method on MakiObject. This method is not used by any skins as far as
  // we know, so we'll just ignore the issue for now.
  onnotify(notifstr: string, a: string, b: number): void {
    this.js_trigger("onNotify", notifstr, a, b);
  }

  onshow(): void {
    this.js_trigger("onShow");
  }

  onhide(): void {
    this.js_trigger("onHide");
  }

  setstatusbar(onoff: boolean): void {
    return unimplementedWarning("setstatusbar");
  }

  getstatusbar(): boolean {
    return unimplementedWarning("getstatusbar");
  }
}

export default Wac;
